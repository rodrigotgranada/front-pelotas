import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppSettingsService, PublicSocialLink } from '../../../core/services/app-settings.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NewsApiService } from '../../../core/services/news-api.service';
import { ToastMessagesService } from '../../../core/notifications/toast-messages.service';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <footer class="bg-slate-950 pt-20 pb-10 border-t-4 border-brand-500 relative overflow-hidden">
      <!-- Decorator -->
      <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-6 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          <!-- Column 1: Brand & Social (col-span-4) -->
          <div class="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
            <a routerLink="/" class="inline-block mb-6 relative group">
              @if (badgeUrl()) {
                <img [src]="badgeUrl()" alt="Escudo E.C. Pelotas" class="h-28 w-auto drop-shadow-2xl group-hover:scale-105 transition-transform duration-500" />
              } @else {
                <div class="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center text-slate-600">Logo</div>
              }
            </a>
            <h3 class="text-3xl font-black text-white tracking-tighter mb-2">E.C. Pelotas</h3>
            <p class="text-slate-400 font-medium mb-8 max-w-sm">
              Mais de um século de história, glórias e tradição na Princesa do Sul. O Lobo nunca deixa de lutar.
            </p>

            <!-- Social Links -->
            <div class="flex flex-col items-center lg:items-start gap-4">
              @for (social of socialLinks(); track $index) {
                <a [href]="social.url" target="_blank" 
                   class="flex items-center gap-4 group/social transition-all">
                  <div [class]="getSocialIconClass(social.type)"
                       class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 transition-all group-hover/social:scale-110 shadow-lg shadow-transparent">
                    <ng-container [ngSwitch]="social.type">
                      <svg *ngSwitchCase="'instagram'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                      <svg *ngSwitchCase="'facebook'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                      <svg *ngSwitchCase="'twitter'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                      <svg *ngSwitchCase="'youtube'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                      <svg *ngSwitchCase="'tiktok'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                      <svg *ngSwitchCase="'whatsapp'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      <svg *ngSwitchDefault xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </ng-container>
                  </div>
                  @if (social.label) {
                    <span class="text-sm font-bold text-slate-400 group-hover/social:text-white transition-colors uppercase tracking-widest">{{ social.label }}</span>
                  } @else {
                    <span class="text-sm font-bold text-slate-400 group-hover/social:text-white transition-colors uppercase tracking-widest">{{ social.type }}</span>
                  }
                </a>
              }
            </div>
          </div>

          <!-- Column 2: Location and Map (col-span-5) -->
          <div class="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h4 class="text-white font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" class="text-brand-500" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              Nossa Casa
            </h4>
            
            <div class="w-full bg-slate-900 rounded-3xl p-2 border border-slate-800 shadow-xl mb-4 h-48 relative overflow-hidden group">
              @if (safeMapsUrl) {
                <!-- Embedded Map -->
                <div class="absolute inset-0 z-0 opacity-80 group-hover:opacity-100 transition-opacity duration-700 bg-slate-800" [innerHTML]="safeMapsUrl"></div>
              } @else {
                <!-- Map Placeholder if no URL is provided -->
                <div class="w-full h-full rounded-2xl bg-slate-800 flex items-center justify-center flex-col gap-2 text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></svg>
                  <span class="text-[10px] font-black uppercase tracking-widest">Mapa Indisponível</span>
                </div>
              }
            </div>

            <ul class="space-y-3 w-full max-w-sm">
              @if (address()) {
                <li class="flex items-start gap-3 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mt-0.5 shrink-0 text-slate-500"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span class="text-sm leading-relaxed">{{ address() }}</span>
                </li>
              }
              @if (phone()) {
                <li class="flex items-center gap-3 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 text-slate-500"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  <span class="text-sm">{{ phone() }}</span>
                </li>
              }
              @if (email()) {
                <li class="flex items-center gap-3 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 text-slate-500"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <a [href]="'mailto:' + email()" class="text-sm hover:text-white hover:underline transition-colors">{{ email() }}</a>
                </li>
              }
            </ul>
          </div>

          <!-- Column 3: Links (col-span-3) -->
          <div class="lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h4 class="text-white font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" class="text-brand-500" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              Links Rápidos
            </h4>
            <ul class="space-y-4">
              <li><a routerLink="/historia" class="text-slate-400 font-medium hover:text-white hover:translate-x-1 transition-all inline-block">História do Clube</a></li>
              @if (isSquadsEnabled()) {
                <li><a routerLink="/elenco" class="text-slate-400 font-medium hover:text-white hover:translate-x-1 transition-all inline-block">Elenco Atual</a></li>
              }
              @if (isIdolsEnabled()) {
                <li><a routerLink="/idolos" class="text-slate-400 font-medium hover:text-white hover:translate-x-1 transition-all inline-block">Ídolos Históricos</a></li>
              }
              @if (settings.isMembershipEnabled()) {
                <li><a routerLink="/seja-socio" class="text-brand-400 font-bold hover:text-brand-300 hover:translate-x-1 transition-all inline-block">Seja Sócio</a></li>
              }
              
              <!-- Dynamic Links -->
              @for (link of links(); track $index) {
                <li>
                  <a [href]="link.url" target="_blank" class="text-slate-400 font-medium hover:text-white hover:translate-x-1 transition-all inline-block flex items-center gap-1.5 group">
                    {{ link.label }}
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-brand-500"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
                  </a>
                </li>
              }
            </ul>

            <!-- Newsletter Section Integration -->
            @if (isNewsletterEnabled()) {
              <div class="mt-12 w-full pt-8 border-t border-white/5">
                <h4 class="text-white font-black uppercase tracking-widest text-xs mb-4">Newsletter</h4>
                <p class="text-slate-500 text-xs mb-4 leading-relaxed">Fique por dentro das novidades do Lobão direto no seu e-mail.</p>
                
                <form (ngSubmit)="subscribeNewsletter()" class="relative group">
                  <input 
                    type="email" 
                    [(ngModel)]="newsletterEmail" 
                    name="email"
                    placeholder="Seu melhor e-mail" 
                    class="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all outline-none"
                    required
                  />
                  <button 
                    type="submit" 
                    [disabled]="isLoading() || !newsletterEmail()"
                    class="absolute right-1 top-1 bottom-1 px-3 bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Inscrever-se"
                  >
                    @if (isLoading()) {
                      <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    }
                  </button>
                </form>
              </div>
            }
          </div>

        </div>

        <!-- Copyright -->
        <div class="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-medium text-slate-600 gap-4 text-center sm:text-left">
          <p>&copy; {{ currentYear }} Esporte Clube Pelotas. Todos os direitos reservados.</p>
          <p>
            Desenvolvido por <a [href]="settings.footerDevUrl()" target="_blank" class="text-brand-400 hover:text-brand-300 transition-colors font-bold">{{ settings.footerDevName() }}</a> em Pelotas, RS
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .bg-slate-800 > iframe {
       width: 100% !important;
       height: 100% !important;
       border-radius: 1rem;
    }
  `]
})
export class PublicFooterComponent {
  readonly settings = inject(AppSettingsService);
  private readonly newsApi = inject(NewsApiService);
  private readonly toast = inject(ToastMessagesService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly currentYear = new Date().getFullYear();
  readonly badgeUrl = this.settings.badgeUrl;
  readonly isSquadsEnabled = this.settings.isSquadsEnabled;
  readonly isNewsletterEnabled = this.settings.isNewsletterEnabled;
  readonly isIdolsEnabled = this.settings.isIdolsEnabled;

  readonly newsletterEmail = signal('');
  readonly isLoading = signal(false);
  
  readonly phone = this.settings.footerPhone;
  readonly email = this.settings.footerEmail;
  readonly address = this.settings.footerAddress;
  
  readonly socialLinks = computed(() => {
    const list = [...this.settings.footerSocialLinks()];
    
    // Add dynamic WhatsApp link if enabled
    if (this.settings.footerIsWhatsapp() && this.settings.footerPhone()) {
      const digitsOnly = this.settings.footerPhone().replace(/\D/g, '');
      // Ensure it has 55 (Brazil) if it seems like a local number without country code
      // Most users will type (53) 9... so digitsOnly will be 539...
      const finalNumber = digitsOnly.length <= 11 ? `55${digitsOnly}` : digitsOnly;
      
      list.push({
        type: 'whatsapp',
        url: `https://wa.me/${finalNumber}`,
        label: this.settings.footerPhone()
      });
    }
    
    return list;
  });

  readonly links = this.settings.footerLinks;

  getSocialIconClass(type: string): string {
    switch (type) {
      case 'instagram': return 'group-hover/social:bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 group-hover/social:text-white group-hover/social:shadow-pink-500/20';
      case 'facebook': return 'group-hover/social:bg-blue-600 group-hover/social:text-white group-hover/social:shadow-blue-500/20';
      case 'youtube': return 'group-hover/social:bg-rose-600 group-hover/social:text-white group-hover/social:shadow-rose-500/20';
      case 'whatsapp': return 'group-hover/social:bg-emerald-500 group-hover/social:text-white group-hover/social:shadow-emerald-500/20';
      default: return 'group-hover/social:bg-brand-500 group-hover/social:text-white group-hover/social:shadow-brand-500/20';
    }
  }

  // We must sanitize the iframe string to render it as raw HTML
  get safeMapsUrl() {
    const rawUrl = this.settings.footerMapsEmbedUrl();
    if (!rawUrl || !rawUrl.includes('<iframe')) return null;
    return this.sanitizer.bypassSecurityTrustHtml(rawUrl);
  }

  subscribeNewsletter() {
    const email = this.newsletterEmail().trim();
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.toast.showError('Por favor, informe um e-mail válido.');
      return;
    }

    this.isLoading.set(true);
    this.newsApi.subscribeNewsletter(email).subscribe({
      next: () => {
        this.toast.showSuccess('Inscrição confirmada! Boas-vindas à nossa Newsletter.');
        this.newsletterEmail.set('');
        this.isLoading.set(false);
      },
      error: (err) => {
        const msg = err.error?.message || 'Erro ao realizar inscrição. Tente novamente.';
        this.toast.showError(msg);
        this.isLoading.set(false);
      }
    });
  }
}
