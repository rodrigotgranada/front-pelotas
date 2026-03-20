import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UpdateOwnUserPayload } from '../../../core/models/auth.model';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { ToastMessagesService, ToastTitle } from '../../../core/notifications/toast-messages.service';
import { UserAddressResponse, UserContactResponse, UserMeResponse } from '../../../core/models/user.model';
import { UsersApiService } from '../../../core/services/users-api.service';
import { HttpClient } from '@angular/common/http';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { SecuritySettingsComponent } from '../components/security-settings.component';
import { ImageCropperDialogComponent } from '../../../shared/ui/image-cropper/image-cropper-dialog.component';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}
import { CpfInputComponent } from '../../../shared/ui/cpf-input/cpf-input.component';
import { EmailInputComponent } from '../../../shared/ui/email-input/email-input.component';
import { PhoneInputComponent } from '../../../shared/ui/phone-input/phone-input.component';
import { CepInputComponent } from '../../../shared/ui/cep-input/cep-input.component';
import { PhotoUploadComponent } from '../../../shared/ui/photo-upload/photo-upload.component';

@Component({
  selector: 'app-me-page',
  imports: [
    SpinnerComponent,
    ReactiveFormsModule,
    SecuritySettingsComponent,
    ImageCropperDialogComponent,
    CpfInputComponent,
    EmailInputComponent,
    PhoneInputComponent,
    CepInputComponent,
    PhotoUploadComponent,
  ],
  templateUrl: './me-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MePageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly session = inject(AuthSessionService);
  private readonly usersApi = inject(UsersApiService);
  private readonly toast = inject(ToastMessagesService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  readonly me = this.session.me;
  readonly loading = this.session.loading;
  readonly saving = signal(false);
  readonly editing = signal(false);
  readonly photoDraft = signal<string | null | undefined>(undefined);
  readonly photoDraftBlob = signal<Blob | null>(null);
  readonly photoPreviewUrl = computed(() => {
    const draft = this.photoDraft();

    if (draft === undefined) {
      return this.me()?.photoUrl ?? null;
    }

    return draft;
  });
  
  imageChangedEvent: any = '';

  readonly profileForm = this.formBuilder.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
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
    if (this.contactsFormArray.length === 1) {
      this.contactsFormArray.at(0).get('isPrimary')?.setValue(true, { emitEvent: false });
    }
  }

  addAddress(): void {
    this.addressesFormArray.push(this.createAddressGroup());
  }

  removeAddress(index: number): void {
    this.addressesFormArray.removeAt(index);
    if (this.addressesFormArray.length === 1) {
      this.addressesFormArray.at(0).get('isPrimary')?.setValue(true, { emitEvent: false });
    }
  }

  onContactPrimaryChange(selectedIndex: number): void {
    const isChecked = this.contactsFormArray.at(selectedIndex).get('isPrimary')?.value;
    if (isChecked) {
      this.contactsFormArray.controls.forEach((control, index) => {
        if (index !== selectedIndex) {
          control.get('isPrimary')?.setValue(false, { emitEvent: false });
        }
      });
    } else if (this.contactsFormArray.length === 1) {
      this.contactsFormArray.at(selectedIndex).get('isPrimary')?.setValue(true, { emitEvent: false });
    }
  }

  onAddressPrimaryChange(selectedIndex: number): void {
    const isChecked = this.addressesFormArray.at(selectedIndex).get('isPrimary')?.value;
    if (isChecked) {
      this.addressesFormArray.controls.forEach((control, index) => {
        if (index !== selectedIndex) {
          control.get('isPrimary')?.setValue(false, { emitEvent: false });
        }
      });
    } else if (this.addressesFormArray.length === 1) {
      this.addressesFormArray.at(selectedIndex).get('isPrimary')?.setValue(true, { emitEvent: false });
    }
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

  async onAddressZipCodeInput(index: number): Promise<void> {
    const group = this.addressesFormArray.at(index);
    const valueControl = group.get('zipCode');
    const rawValue = String(valueControl?.value ?? '');
    const masked = this.maskZipCode(rawValue);
    valueControl?.setValue(masked, { emitEvent: false });

    const digits = masked.replace(/\D/g, '');
    if (digits.length === 8) {
      group.get('loadingCep')?.setValue(true);
      try {
        const response = await firstValueFrom(this.http.get<ViaCepResponse>(`https://viacep.com.br/ws/${digits}/json/`));
        if (!response.erro) {
          group.patchValue({
            street: response.logradouro,
            neighborhood: response.bairro,
            city: response.localidade,
            state: response.uf,
          });
        }
      } catch (error) {
        // Fallback: let user type
      } finally {
        group.get('loadingCep')?.setValue(false);
      }
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (!input.files[0].type.startsWith('image/')) {
        this.toast.showWarning('Selecione apenas arquivos de imagem.', ToastTitle.Warning);
        input.value = '';
        return;
      }
      this.imageChangedEvent = event;
    }
  }

  onImageCropped(blob: Blob): void {
    this.photoDraftBlob.set(blob);
    this.photoDraft.set(URL.createObjectURL(blob));
    this.imageChangedEvent = '';
  }

  onCropCancel(): void {
    this.imageChangedEvent = '';
  }

  removePhoto(): void {
    this.photoDraftBlob.set(null);
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

    if (raw.firstName && raw.firstName.trim() !== current.firstName) {
      payload.firstName = raw.firstName.trim();
    }
    
    if (raw.lastName && raw.lastName.trim() !== current.lastName) {
      payload.lastName = raw.lastName.trim();
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

    const hasPhotoChange = this.photoDraft() !== undefined;

    if (Object.keys(payload).length === 0 && !hasPhotoChange) {
      this.toast.showInfo('Nenhuma alteracao para salvar.', ToastTitle.Info);
      return;
    }

    this.saving.set(true);

    try {
      if (Object.keys(payload).length > 0) {
        await firstValueFrom(this.usersApi.updateMe(payload));
      }
      
      if (hasPhotoChange) {
        const blob = this.photoDraftBlob();
        if (blob) {
          await firstValueFrom(this.usersApi.uploadOwnPhoto(blob));
        } else if (this.photoDraft() === null && current.photoUrl) {
           // Em caso de API de deletar foto, por ora ignoramos se for null (a ser removido via backend apropriado)
           // Assumindo que photoUrl empty remove, se ajustado no backend
        }
      }

      this.toast.showSuccess('Seus dados foram atualizados com sucesso.', ToastTitle.ProfileUpdateSuccess);
      await this.refreshProfile();
      this.editing.set(false);
      this.photoDraft.set(undefined);
      this.photoDraftBlob.set(null);
      this.profileForm.disable();
    } catch (error) {
      this.toast.showApiError(error, ToastTitle.ProfileUpdateFailure);
    } finally {
      this.saving.set(false);
    }
  }

  private createContactGroup(contact?: UserContactResponse) {
    const isWhatsapp = contact?.type === 'whatsapp';
    const typeValue = isWhatsapp ? 'celular' : (contact?.type ?? 'celular');

    return this.formBuilder.group({
      type: [typeValue, [Validators.required]],
      value: [contact?.value ?? '', [Validators.required]],
      isWhatsapp: [isWhatsapp],
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
      loadingCep: [false],
    });
  }

  private populateForm(profile: UserMeResponse): void {
    this.profileForm.patchValue({
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
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
    const raw = this.contactsFormArray.getRawValue() as Array<{ type?: string; value?: string; isWhatsapp?: boolean; isPrimary?: boolean }>;

    const contacts = raw
      .map((contact, i, arr) => ({
        type: contact.isWhatsapp && (contact.type ?? '').trim() === 'celular' ? 'whatsapp' : (contact.type ?? '').trim(),
        value: (contact.value ?? '').trim(),
        isPrimary: arr.length === 1 ? true : !!contact.isPrimary,
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
      .map((address, i, arr) => ({
        type: (address.type ?? '').trim(),
        street: (address.street ?? '').trim(),
        number: (address.number ?? '').trim(),
        complement: (address.complement ?? '').trim() || undefined,
        neighborhood: (address.neighborhood ?? '').trim(),
        city: (address.city ?? '').trim(),
        state: (address.state ?? '').trim(),
        zipCode: (address.zipCode ?? '').trim(),
        country: (address.country ?? '').trim(),
        isPrimary: arr.length === 1 ? true : !!address.isPrimary,
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
