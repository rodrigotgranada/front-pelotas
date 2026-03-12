import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UpdateOwnUserPayload } from '../../../core/models/auth.model';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { ToastMessagesService, ToastTitle } from '../../../core/notifications/toast-messages.service';
import { UserAddressResponse, UserContactResponse, UserMeResponse } from '../../../core/models/user.model';
import { UsersApiService } from '../../../core/services/users-api.service';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { SecuritySettingsComponent } from '../components/security-settings.component';

@Component({
  selector: 'app-me-page',
  imports: [SpinnerComponent, ReactiveFormsModule, SecuritySettingsComponent],
  templateUrl: './me-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MePageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly session = inject(AuthSessionService);
  private readonly usersApi = inject(UsersApiService);
  private readonly toast = inject(ToastMessagesService);
  private readonly router = inject(Router);

  readonly me = this.session.me;
  readonly loading = this.session.loading;
  readonly saving = signal(false);
  readonly editing = signal(false);
  readonly photoDraft = signal<string | null | undefined>(undefined);
  readonly photoPreviewUrl = computed(() => {
    const draft = this.photoDraft();

    if (draft === undefined) {
      return this.me()?.photoUrl ?? null;
    }

    return draft;
  });

  readonly profileForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    document: [{ value: '', disabled: true }],
    documentType: [{ value: '', disabled: true }],
    password: ['', [Validators.minLength(6)]],
    contacts: this.formBuilder.array([]),
    addresses: this.formBuilder.array([]),
  });

  get contactsFormArray(): FormArray {
    return this.profileForm.get('contacts') as FormArray;
  }

  get addressesFormArray(): FormArray {
    return this.profileForm.get('addresses') as FormArray;
  }

  ngOnInit(): void {
    void this.refreshProfile();
  }

  async refreshProfile(): Promise<void> {
    const result = await this.session.hydrateSession();

    if (result === 'invalid-session' || result === 'no-token') {
      await this.router.navigateByUrl('/');
      return;
    }

    if (result === 'error') {
      this.toast.showApiError('Nao foi possivel carregar o perfil no momento.', ToastTitle.ProfileLoadFailure);
      return;
    }

    const profile = this.me();
    if (profile) {
      this.populateForm(profile);
    }
  }

  startEditing(): void {
    this.editing.set(true);
    this.profileForm.enable();
    this.profileForm.get('email')?.disable();
    this.profileForm.get('document')?.disable();
    this.profileForm.get('documentType')?.disable();
  }

  cancelEditing(): void {
    this.editing.set(false);
    this.photoDraft.set(undefined);

    const profile = this.me();
    if (profile) {
      this.populateForm(profile);
    }

    this.profileForm.markAsPristine();
  }

  addContact(): void {
    this.contactsFormArray.push(this.createContactGroup());
  }

  removeContact(index: number): void {
    this.contactsFormArray.removeAt(index);
  }

  addAddress(): void {
    this.addressesFormArray.push(this.createAddressGroup());
  }

  removeAddress(index: number): void {
    this.addressesFormArray.removeAt(index);
  }

  onContactValueInput(index: number): void {
    const group = this.contactsFormArray.at(index);
    const typeValue = String(group.get('type')?.value ?? '');
    const valueControl = group.get('value');
    const rawValue = String(valueControl?.value ?? '');

    if (this.isPhoneContact(typeValue)) {
      valueControl?.setValue(this.maskPhone(rawValue), { emitEvent: false });
      return;
    }

    if (this.isEmailContact(typeValue)) {
      valueControl?.setValue(rawValue.trim(), { emitEvent: false });
    }
  }

  onAddressZipCodeInput(index: number): void {
    const group = this.addressesFormArray.at(index);
    const valueControl = group.get('zipCode');
    const rawValue = String(valueControl?.value ?? '');
    valueControl?.setValue(this.maskZipCode(rawValue), { emitEvent: false });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.toast.showWarning('Selecione apenas arquivos de imagem.', ToastTitle.Warning);
      input.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.toast.showWarning('A imagem deve ter no maximo 2MB.', ToastTitle.Warning);
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      this.photoDraft.set(result);
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.photoDraft.set(null);
  }

  async saveProfile(): Promise<void> {
    if (!this.editing()) {
      return;
    }

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.toast.showInvalidFormWarning();
      return;
    }

    const current = this.me();
    if (!current) {
      this.toast.showApiError('Perfil nao carregado.', ToastTitle.ProfileUpdateFailure);
      return;
    }

    const raw = this.profileForm.getRawValue();
    const payload: UpdateOwnUserPayload = {};

    if (raw.name && raw.name.trim() !== current.name) {
      payload.name = raw.name.trim();
    }

    if ((raw.password ?? '').trim()) {
      payload.password = raw.password!.trim();
    }

    let contacts: NonNullable<UpdateOwnUserPayload['contacts']> = [];
    let addresses: NonNullable<UpdateOwnUserPayload['addresses']> = [];

    try {
      contacts = this.getNormalizedFormContacts();
      addresses = this.getNormalizedFormAddresses();
    } catch (error) {
      this.toast.showWarning(
        error instanceof Error ? error.message : 'Existem dados invalidos no formulario.',
        ToastTitle.Warning,
      );
      return;
    }

    if (JSON.stringify(contacts) !== JSON.stringify(this.getProfileContacts(current))) {
      payload.contacts = contacts;
    }

    if (JSON.stringify(addresses) !== JSON.stringify(this.getProfileAddresses(current))) {
      payload.addresses = addresses;
    }

    const draftPhoto = this.photoDraft();
    if (draftPhoto !== undefined) {
      payload.photoUrl = draftPhoto ?? '';
    }

    if (Object.keys(payload).length === 0) {
      this.toast.showInfo('Nenhuma alteracao para salvar.', ToastTitle.Info);
      return;
    }

    this.saving.set(true);

    try {
      await firstValueFrom(this.usersApi.updateMe(payload));
      this.toast.showSuccess('Seus dados foram atualizados com sucesso.', ToastTitle.ProfileUpdateSuccess);
      await this.refreshProfile();
      this.editing.set(false);
      this.photoDraft.set(undefined);
      this.profileForm.disable();
    } catch (error) {
      this.toast.showApiError(error, ToastTitle.ProfileUpdateFailure);
    } finally {
      this.saving.set(false);
    }
  }

  private createContactGroup(contact?: UserContactResponse) {
    return this.formBuilder.group({
      type: [contact?.type ?? '', [Validators.required]],
      value: [contact?.value ?? '', [Validators.required]],
      isPrimary: [contact?.isPrimary ?? false],
    });
  }

  private createAddressGroup(address?: UserAddressResponse) {
    return this.formBuilder.group({
      type: [address?.type ?? '', [Validators.required]],
      street: [address?.street ?? '', [Validators.required]],
      number: [address?.number ?? '', [Validators.required]],
      complement: [address?.complement ?? ''],
      neighborhood: [address?.neighborhood ?? '', [Validators.required]],
      city: [address?.city ?? '', [Validators.required]],
      state: [address?.state ?? '', [Validators.required]],
      zipCode: [address?.zipCode ?? '', [Validators.required]],
      country: [address?.country ?? 'Brasil', [Validators.required]],
      isPrimary: [address?.isPrimary ?? false],
    });
  }

  private populateForm(profile: UserMeResponse): void {
    this.profileForm.patchValue({
      name: profile.name ?? '',
      email: profile.email ?? '',
      document: profile.document ?? '',
      documentType: profile.documentType ?? '',
      password: '',
    });

    this.photoDraft.set(undefined);

    this.contactsFormArray.clear();
    for (const contact of profile.contacts ?? []) {
      this.contactsFormArray.push(this.createContactGroup(contact));
    }

    this.addressesFormArray.clear();
    for (const address of profile.addresses ?? []) {
      this.addressesFormArray.push(this.createAddressGroup(address));
    }

    if (this.editing()) {
      this.profileForm.enable();
      this.profileForm.get('email')?.disable();
      this.profileForm.get('document')?.disable();
      this.profileForm.get('documentType')?.disable();
    } else {
      this.profileForm.disable();
      this.profileForm.get('email')?.disable();
      this.profileForm.get('document')?.disable();
      this.profileForm.get('documentType')?.disable();
    }
  }

  private getNormalizedFormContacts(): NonNullable<UpdateOwnUserPayload['contacts']> {
    const raw = this.contactsFormArray.getRawValue() as Array<{ type?: string; value?: string; isPrimary?: boolean }>;

    const contacts = raw
      .map((contact) => ({
        type: (contact.type ?? '').trim(),
        value: (contact.value ?? '').trim(),
        isPrimary: !!contact.isPrimary,
      }))
      .filter((contact) => contact.type.length > 0 && contact.value.length > 0);

    for (const contact of contacts) {
      if (this.isPhoneContact(contact.type)) {
        const digits = contact.value.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 11) {
          throw new Error('Contato de telefone/celular deve ter 10 ou 11 digitos.');
        }
      }

      if (this.isEmailContact(contact.type)) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.value)) {
          throw new Error('Contato de email esta em formato invalido.');
        }
      }
    }

    return contacts;
  }

  private getProfileContacts(profile: UserMeResponse): NonNullable<UpdateOwnUserPayload['contacts']> {
    return (profile.contacts ?? []).map((contact) => ({
      type: (contact.type ?? '').trim(),
      value: (contact.value ?? '').trim(),
      isPrimary: !!contact.isPrimary,
    }));
  }

  private getNormalizedFormAddresses(): NonNullable<UpdateOwnUserPayload['addresses']> {
    const raw = this.addressesFormArray.getRawValue() as Array<{
      type?: string;
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
      isPrimary?: boolean;
    }>;

    const addresses = raw
      .map((address) => ({
        type: (address.type ?? '').trim(),
        street: (address.street ?? '').trim(),
        number: (address.number ?? '').trim(),
        complement: (address.complement ?? '').trim() || undefined,
        neighborhood: (address.neighborhood ?? '').trim(),
        city: (address.city ?? '').trim(),
        state: (address.state ?? '').trim(),
        zipCode: (address.zipCode ?? '').trim(),
        country: (address.country ?? '').trim(),
        isPrimary: !!address.isPrimary,
      }))
      .filter(
        (address) =>
          address.type.length > 0 &&
          address.street.length > 0 &&
          address.number.length > 0 &&
          address.neighborhood.length > 0 &&
          address.city.length > 0 &&
          address.state.length > 0 &&
          address.zipCode.length > 0 &&
          address.country.length > 0,
      );

    for (const address of addresses) {
      const zipDigits = address.zipCode.replace(/\D/g, '');
      if (zipDigits.length !== 8) {
        throw new Error('CEP deve conter 8 digitos.');
      }
    }

    return addresses;
  }

  private getProfileAddresses(profile: UserMeResponse): NonNullable<UpdateOwnUserPayload['addresses']> {
    return (profile.addresses ?? []).map((address) => ({
      type: (address.type ?? '').trim(),
      street: (address.street ?? '').trim(),
      number: (address.number ?? '').trim(),
      complement: (address.complement ?? '').trim() || undefined,
      neighborhood: (address.neighborhood ?? '').trim(),
      city: (address.city ?? '').trim(),
      state: (address.state ?? '').trim(),
      zipCode: (address.zipCode ?? '').trim(),
      country: (address.country ?? '').trim(),
      isPrimary: !!address.isPrimary,
    }));
  }

  private isPhoneContact(typeValue: string): boolean {
    return /(cel|telefone|phone|whats)/i.test(typeValue);
  }

  private isEmailContact(typeValue: string): boolean {
    return /email/i.test(typeValue);
  }

  private maskPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) {
      return digits;
    }

    if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  private maskZipCode(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) {
      return digits;
    }

    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
}
