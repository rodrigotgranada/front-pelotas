import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { ToastMessagesService, ToastTitle } from '../../../core/notifications/toast-messages.service';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { UsersApiService } from '../../../core/services/users-api.service';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { RegisterRequest } from '../../../core/models/auth.model';
import { ImageCropperDialogComponent } from '../../../shared/ui/image-cropper/image-cropper-dialog.component';
import { PasswordInputComponent } from '../../../shared/ui/password-input/password-input.component';
import { CpfInputComponent } from '../../../shared/ui/cpf-input/cpf-input.component';
import { EmailInputComponent } from '../../../shared/ui/email-input/email-input.component';
import { PhoneInputComponent } from '../../../shared/ui/phone-input/phone-input.component';
import { CepInputComponent } from '../../../shared/ui/cep-input/cep-input.component';
import { CodeInputComponent } from '../../../shared/ui/code-input/code-input.component';
import { PhotoUploadComponent } from '../../../shared/ui/photo-upload/photo-upload.component';
import { AppSettingsService } from '../../../core/services/app-settings.service';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

@Component({
  selector: 'app-register-page',
  imports: [
    ReactiveFormsModule, 
    RouterLink, 
    SpinnerComponent, 
    ImageCropperDialogComponent, 
    PasswordInputComponent,
    CpfInputComponent,
    EmailInputComponent,
    PhoneInputComponent,
    CepInputComponent,
    CodeInputComponent,
    PhotoUploadComponent,
  ],
  templateUrl: './register-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly usersApi = inject(UsersApiService);
  private readonly session = inject(AuthSessionService);
  private readonly toast = inject(ToastMessagesService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  readonly appSettings = inject(AppSettingsService);

  readonly registerForm = this.formBuilder.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    document: ['', [Validators.required]],
    contacts: this.formBuilder.array([]),
    addresses: this.formBuilder.array([]),
  }, { validators: this.passwordMatchValidator });

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (form.get('confirmPassword')?.hasError('passwordMismatch')) {
      const errors = { ...form.get('confirmPassword')?.errors };
      delete errors['passwordMismatch'];
      form.get('confirmPassword')?.setErrors(Object.keys(errors).length ? errors : null);
    }
    
    return null;
  }

  readonly verifyEmailForm = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  get contactsFormArray(): FormArray {
    return this.registerForm.get('contacts') as FormArray;
  }

  get addressesFormArray(): FormArray {
    return this.registerForm.get('addresses') as FormArray;
  }

  readonly loading = signal(false);
  readonly pendingEmailVerification = signal(false);
  readonly verificationEmail = signal<string | null>(null);
  
  imageChangedEvent: any = '';
  private selectedPhoto: File | Blob | null = null;
  readonly photoPreviewUrl = signal<string | null>(null); // To show preview on the form

  constructor() {
    this.addContact();
    this.addAddress();
  }

  addContact(): void {
    this.contactsFormArray.push(
      this.formBuilder.group({
        type: ['celular', [Validators.required]],
        value: ['', [Validators.required]],
        isWhatsapp: [false],
        isPrimary: [this.contactsFormArray.length === 0],
      })
    );
  }

  removeContact(index: number): void {
    this.contactsFormArray.removeAt(index);
    if (this.contactsFormArray.length === 1) {
      this.contactsFormArray.at(0).get('isPrimary')?.setValue(true, { emitEvent: false });
    }
  }

  addAddress(): void {
    this.addressesFormArray.push(
      this.formBuilder.group({
        type: ['home', [Validators.required]],
        zipCode: ['', [Validators.required, Validators.minLength(8)]],
        street: ['', [Validators.required]],
        number: ['', [Validators.required]],
        complement: [''],
        neighborhood: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        country: ['Brasil', [Validators.required]],
        isPrimary: [this.addressesFormArray.length === 0],
        loadingCep: [false],
      })
    );
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
      // Force it to stay checked if it's the only one
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
      // Force it to stay checked if it's the only one
      this.addressesFormArray.at(selectedIndex).get('isPrimary')?.setValue(true, { emitEvent: false });
    }
  }

  onContactValueInput(index: number): void {
    const group = this.contactsFormArray.at(index);
    const typeValue = String(group.get('type')?.value ?? '');
    const valueControl = group.get('value');
    const rawValue = String(valueControl?.value ?? '');

    if (/(cel|telefone|phone|whats)/i.test(typeValue)) {
      valueControl?.setValue(this.maskPhone(rawValue), { emitEvent: false });
    } else if (/email/i.test(typeValue)) {
      valueControl?.setValue(rawValue.trim(), { emitEvent: false });
    }
  }

  async onZipCodeInput(index: number): Promise<void> {
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
        // Ignorar erro do viacep e deixar usuario digitar
      } finally {
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
    this.imageChangedEvent = ''; // Close modal
  }

  onCropCancel(): void {
    this.imageChangedEvent = ''; // Close modal
    
    // Reset file input in UI
    const input = document.getElementById('photo') as HTMLInputElement;
    if (input) input.value = '';
  }

  removePhoto(): void {
    this.selectedPhoto = null;
    this.photoPreviewUrl.set(null);
    const input = document.getElementById('photo') as HTMLInputElement;
    if (input) input.value = '';
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.toast.showInvalidFormWarning();
      return;
    }

    const rawForm = this.registerForm.getRawValue();

    try {
      this.validateFormArrays(rawForm.contacts as any[], rawForm.addresses as any[]);
    } catch (error) {
      this.toast.showWarning(error instanceof Error ? error.message : 'Existem dados invalidos no formulario.', ToastTitle.Warning);
      return;
    }

    this.loading.set(true);

    try {
      const payload: RegisterRequest = {
        firstName: rawForm.firstName?.trim() ?? '',
        lastName: rawForm.lastName?.trim() ?? '',
        email: rawForm.email?.trim() ?? '',
        password: rawForm.password?.trim() ?? '',
        document: rawForm.document?.trim() ?? '',
        documentType: 'cpf',
        contacts: (rawForm.contacts as any[]).map((c, i, arr) => ({
          type: c.isWhatsapp && c.type === 'celular' ? 'whatsapp' : c.type.trim(),
          value: c.value.trim(),
          isPrimary: arr.length === 1 ? true : !!c.isPrimary,
        })),
        addresses: (rawForm.addresses as any[]).map((a, i, arr) => ({
          type: a.type.trim(),
          street: a.street.trim(),
          number: a.number.trim(),
          complement: a.complement?.trim() || undefined,
          neighborhood: a.neighborhood.trim(),
          city: a.city.trim(),
          state: a.state.trim(),
          zipCode: a.zipCode.trim(),
          country: a.country.trim(),
          isPrimary: arr.length === 1 ? true : !!a.isPrimary,
        })),
      };

      const response = await firstValueFrom(this.authApi.register(payload));

      if (response.requiresEmailVerification) {
        this.pendingEmailVerification.set(true);
        this.verificationEmail.set(payload.email);
        this.toast.showInfo('Digite o codigo enviado para o seu email para concluir o cadastro.', ToastTitle.Info);
      } else {
        await this.session.hydrateSession();
        await this.handlePhotoUpload();
        this.toast.showSuccess('Cadastro realizado com sucesso!', ToastTitle.Success);
        await this.router.navigateByUrl('/app/me');
      }
    } catch (error) {
      this.toast.showApiError(error, 'Falha no cadastro');
    } finally {
      this.loading.set(false);
    }
  }

  async onVerifyEmail(): Promise<void> {
    if (this.verifyEmailForm.invalid || !this.verificationEmail()) {
      this.verifyEmailForm.markAllAsTouched();
      this.toast.showInvalidFormWarning();
      return;
    }

    this.loading.set(true);

    try {
      await firstValueFrom(
        this.authApi.verifyEmail({
          email: this.verificationEmail()!,
          code: this.verifyEmailForm.getRawValue().code.trim(),
        }),
      );

      await this.session.hydrateSession();
      await this.handlePhotoUpload();

      this.pendingEmailVerification.set(false);
      this.verifyEmailForm.reset();
      this.toast.showSuccess('Email verificado e cadastro concluido com sucesso!', ToastTitle.Success);
      await this.router.navigateByUrl('/app/me');
    } catch (error) {
      this.toast.showApiError(error, 'Falha na verificacao');
    } finally {
      this.loading.set(false);
    }
  }

  async resendCode(): Promise<void> {
    if (!this.verificationEmail()) {
      this.toast.showWarning('Email de cadastro nao encontrado.', ToastTitle.Warning);
      return;
    }

    this.loading.set(true);

    try {
      await firstValueFrom(this.authApi.resendVerificationCode({ email: this.verificationEmail()! }));
      this.toast.showInfo('Codigo reenviado. Verifique sua caixa de entrada.', ToastTitle.Info);
    } catch (error) {
      this.toast.showApiError(error, 'Falha ao reenviar codigo');
    } finally {
      this.loading.set(false);
    }
  }

  private async handlePhotoUpload(): Promise<void> {
    if (!this.selectedPhoto) {
      return;
    }

    try {
      await firstValueFrom(this.usersApi.uploadOwnPhoto(this.selectedPhoto));
    } catch (error) {
      this.toast.showWarning('Sua conta foi criada, mas houve um erro ao enviar a foto.', 'Foto nao enviada');
    }
  }

  private validateFormArrays(contacts: any[], addresses: any[]): void {
    if (!contacts || contacts.length === 0) {
      throw new Error('Adicione pelo menos um contato.');
    }

    for (const contact of contacts) {
      if (/(cel|telefone|phone|whats)/i.test(contact.type)) {
        const digits = (contact.value ?? '').replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 11) {
          throw new Error('Contato de telefone/celular deve ter 10 ou 11 digitos.');
        }
      } else if (/email/i.test(contact.type)) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.value)) {
          throw new Error('Ao menos um contato de e-mail esta em formato invalido.');
        }
      }
    }

    for (const address of addresses) {
      const zipDigits = (address.zipCode ?? '').replace(/\D/g, '');
      if (zipDigits.length !== 8) {
        throw new Error('Todos os CEPs devem conter 8 digitos válidos.');
      }
    }
  }

  private maskPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  private maskZipCode(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
}
