import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastMessagesService, ToastTitle } from '../../../../core/notifications/toast-messages.service';
import { UsersApiService } from '../../../../core/services/users-api.service';
import { RolesApiService } from '../../../../core/services/roles-api.service';
import { MembershipService, MembershipPlan } from '../../../../shared/master-bypass-v2';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { EmailInputComponent } from '../../../../shared/ui/email-input/email-input.component';
import { CpfInputComponent } from '../../../../shared/ui/cpf-input/cpf-input.component';
import { PhoneInputComponent } from '../../../../shared/ui/phone-input/phone-input.component';
import { CepInputComponent } from '../../../../shared/ui/cep-input/cep-input.component';
import { PhotoUploadComponent } from '../../../../shared/ui/photo-upload/photo-upload.component';
import { ImageCropperDialogComponent } from '../../../../shared/ui/image-cropper/image-cropper-dialog.component';
import { PasswordInputComponent } from '../../../../shared/ui/password-input/password-input.component';
import { UserResponse, UserContactResponse, UserAddressResponse } from '../../../../core/models/user.model';

interface ViaCepResponse {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

@Component({
  selector: 'app-admin-create-user-drawer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SpinnerComponent,
    EmailInputComponent,
    CpfInputComponent,
    PhoneInputComponent,
    CepInputComponent,
    PhotoUploadComponent,
    ImageCropperDialogComponent,
    PasswordInputComponent,
  ],
  templateUrl: './admin-create-user-drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCreateUserDrawerComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersApi = inject(UsersApiService);
  private readonly rolesApi = inject(RolesApiService);
  private readonly toast = inject(ToastMessagesService);
  private readonly http = inject(HttpClient);
  private readonly membershipApi = inject(MembershipService);

  @Input() editUser?: UserResponse | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  readonly loading = signal(false);
  readonly activeTab = signal<'basic' | 'contacts' | 'address' | 'photo'>('basic');

  readonly tabList: Array<{ id: 'basic' | 'contacts' | 'address' | 'photo'; label: string }> = [
    { id: 'basic', label: 'Dados Básicos' },
    { id: 'contacts', label: 'Contatos' },
    { id: 'address', label: 'Endereços' },
    { id: 'photo', label: 'Foto' },
  ];

  imageChangedEvent: any = '';
  private selectedPhoto: File | Blob | null = null;
  readonly photoPreviewUrl = signal<string | null>(null);

  readonly activeRoles = toSignal(
    this.rolesApi.listActive().pipe(map((roles) => roles.filter((r) => r.code !== 'owner'))),
    { initialValue: [] }
  );

  readonly membershipPlans = toSignal(
    this.membershipApi.getPlans().pipe(map((plans: MembershipPlan[]) => plans.filter(p => p.isActive))),
    { initialValue: [] as MembershipPlan[] }
  );

  readonly form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    document: [''],
    documentType: ['cpf'],
    roleId: ['', [Validators.required]],
    isActive: [true],
    membershipPlanId: [''],
    isMembershipPayed: [true],
    contacts: this.fb.array([]),
    addresses: this.fb.array([]),
  });

  isSocioSelected(): boolean {
    const roleId = this.form.get('roleId')?.value;
    const role = this.activeRoles().find(r => r.id === roleId);
    return role?.code === 'socio';
  }

  ngOnInit(): void {
    if (this.editUser) {
      this.form.patchValue({
        firstName: this.editUser.firstName,
        lastName: this.editUser.lastName,
        email: this.editUser.email,
        document: this.editUser.document || '',
        documentType: this.editUser.documentType || 'cpf',
        roleId: this.editUser.roleId || '',
        isActive: this.editUser.isActive,
      });

      // Clear password requirement for edit mode
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();

      // Populate Contacts
      if (this.editUser.contacts && this.editUser.contacts.length > 0) {
        this.editUser.contacts.forEach((contact) => {
          this.contactsArray.push(this.fb.group({
            type: [contact.type === 'whatsapp' ? 'celular' : contact.type, Validators.required],
            value: [contact.value, Validators.required],
            isWhatsapp: [contact.type === 'whatsapp'],
            isPrimary: [contact.isPrimary],
          }));
        });
      }

      // Populate Addresses
      if (this.editUser.addresses && this.editUser.addresses.length > 0) {
        this.editUser.addresses.forEach((addr) => {
          this.addressesArray.push(this.fb.group({
            type: [addr.type, Validators.required],
            zipCode: [addr.zipCode, [Validators.required, Validators.minLength(8)]],
            street: [addr.street, Validators.required],
            number: [addr.number, Validators.required],
            complement: [addr.complement || ''],
            neighborhood: [addr.neighborhood, Validators.required],
            city: [addr.city, Validators.required],
            state: [addr.state, Validators.required],
            country: [addr.country, Validators.required],
            isPrimary: [addr.isPrimary],
            loadingCep: [false],
          }));
        });
      }
      
      if (this.editUser.photoUrl) {
        this.photoPreviewUrl.set(this.editUser.photoUrl);
      }
    } else {
      this.addContact();
    }
  }

  get contactsArray(): FormArray {
    return this.form.get('contacts') as FormArray;
  }

  get addressesArray(): FormArray {
    return this.form.get('addresses') as FormArray;
  }

  addContact(): void {
    this.contactsArray.push(this.fb.group({
      type: ['celular', Validators.required],
      value: ['', Validators.required],
      isWhatsapp: [false],
      isPrimary: [this.contactsArray.length === 0],
    }));
  }

  removeContact(index: number): void {
    this.contactsArray.removeAt(index);
    if (this.contactsArray.length === 1) {
      this.contactsArray.at(0).get('isPrimary')?.setValue(true, { emitEvent: false });
    }
  }

  onContactPrimaryChange(selectedIndex: number): void {
    this.contactsArray.controls.forEach((ctrl, i) => {
      if (i !== selectedIndex) ctrl.get('isPrimary')?.setValue(false, { emitEvent: false });
    });
    if (this.contactsArray.length === 1) {
      this.contactsArray.at(0).get('isPrimary')?.setValue(true, { emitEvent: false });
    }
  }

  addAddress(): void {
    this.addressesArray.push(this.fb.group({
      type: ['home', Validators.required],
      zipCode: ['', [Validators.required, Validators.minLength(8)]],
      street: ['', Validators.required],
      number: ['', Validators.required],
      complement: [''],
      neighborhood: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['Brasil', Validators.required],
      isPrimary: [this.addressesArray.length === 0],
      loadingCep: [false],
    }));
  }

  removeAddress(index: number): void {
    this.addressesArray.removeAt(index);
    if (this.addressesArray.length === 1) {
      this.addressesArray.at(0).get('isPrimary')?.setValue(true, { emitEvent: false });
    }
  }

  onAddressPrimaryChange(selectedIndex: number): void {
    this.addressesArray.controls.forEach((ctrl, i) => {
      if (i !== selectedIndex) ctrl.get('isPrimary')?.setValue(false, { emitEvent: false });
    });
    if (this.addressesArray.length === 1) {
      this.addressesArray.at(0).get('isPrimary')?.setValue(true, { emitEvent: false });
    }
  }

  async onZipCodeInput(index: number): Promise<void> {
    const group = this.addressesArray.at(index) as FormGroup;
    const raw = (group.get('zipCode')?.value ?? '').replace(/\D/g, '');
    if (raw.length === 8) {
      group.get('loadingCep')?.setValue(true);
      try {
        const res = await firstValueFrom(this.http.get<ViaCepResponse>(`https://viacep.com.br/ws/${raw}/json/`));
        if (!res.erro) {
          group.patchValue({
            street: res.logradouro,
            neighborhood: res.bairro,
            city: res.localidade,
            state: res.uf,
          });
        }
      } catch { /* ignore */ } finally {
        group.get('loadingCep')?.setValue(false);
      }
    }
  }

  onFileSelected(event: Event): void {
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
    this.selectedPhoto = blob;
    this.photoPreviewUrl.set(URL.createObjectURL(blob));
    this.imageChangedEvent = '';
  }

  onCropCancel(): void {
    this.imageChangedEvent = '';
  }

  removePhoto(): void {
    this.selectedPhoto = null;
    this.photoPreviewUrl.set(null);
  }

  hasError(controlName: string): boolean {
    const ctrl = this.form.get(controlName);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  maskPhone(value: string): string {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  onContactValueInput(index: number): void {
    const group = this.contactsArray.at(index) as FormGroup;
    const type = String(group.get('type')?.value ?? '');
    const ctrl = group.get('value');
    const raw = String(ctrl?.value ?? '');
    if (/(cel|telefone|phone|whats)/i.test(type)) {
      ctrl?.setValue(this.maskPhone(raw), { emitEvent: false });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.showInvalidFormWarning();
      return;
    }

    this.loading.set(true);
    const raw = this.form.getRawValue();

    const contacts = (raw.contacts as any[]).map((c, i, arr) => ({
      type: c.isWhatsapp && c.type === 'celular' ? 'whatsapp' : c.type,
      value: c.value,
      isPrimary: arr.length === 1 ? true : !!c.isPrimary,
    }));

    const addresses = (raw.addresses as any[]).map((a, i, arr) => ({
      type: a.type,
      street: a.street,
      number: a.number,
      complement: a.complement || undefined,
      neighborhood: a.neighborhood,
      city: a.city,
      state: a.state,
      zipCode: a.zipCode,
      country: a.country,
      isPrimary: arr.length === 1 ? true : !!a.isPrimary,
    }));

    const payload: any = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      password: raw.password || undefined,
      document: raw.document || undefined,
      documentType: 'cpf',
      roleId: raw.roleId,
      isActive: raw.isActive,
      membershipPlanId: this.isSocioSelected() ? raw.membershipPlanId : undefined,
      isMembershipPayed: this.isSocioSelected() ? raw.isMembershipPayed : undefined,
      contacts,
      addresses,
    };

    try {
      let response;
      if (this.editUser) {
        // Edit Mode
        response = await firstValueFrom(this.usersApi.update(this.editUser.id, payload));
        if (this.selectedPhoto && response?.id) {
          try {
            await firstValueFrom(this.usersApi.uploadUserPhoto(response.id, this.selectedPhoto));
          } catch {
            this.toast.showWarning('Usuário atualizado, mas houve erro ao atualizar a foto.', 'Foto não enviada');
          }
        }
        this.toast.showSuccess('Usuário atualizado com sucesso!', 'Sucesso');

      } else {
        // Create Mode
        response = await firstValueFrom(this.usersApi.createAdmin(payload));
        if (this.selectedPhoto && response?.id) {
          try {
            await firstValueFrom(this.usersApi.uploadUserPhoto(response.id, this.selectedPhoto));
          } catch {
            this.toast.showWarning('Usuário criado, mas houve erro ao enviar a foto.', 'Foto não enviada');
          }
        }
        this.toast.showSuccess(
          raw.isActive
            ? 'Usuário criado e ativado com sucesso!'
            : 'Usuário criado! Ele precisará verificar o e-mail para ativar a conta.',
          'Sucesso'
        );
      }

      this.saved.emit();
    } catch (error) {
      this.toast.showApiError(error, this.editUser ? 'Falha ao atualizar o usuario' : ToastTitle.UserRegistrationFailure);
    } finally {
      this.loading.set(false);
    }
  }
}
