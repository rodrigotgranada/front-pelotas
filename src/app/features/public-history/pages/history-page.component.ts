import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HistoryApiService } from '../../../shared/master-bypass-v2';
import { History } from '../../../core/models/history.model';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { AppSettingsService } from '../../../core/services/app-settings.service';


@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 font-sans selection:bg-amber-400 selection:text-slate-900 pb-32">
      
      <!-- HERO HEADER / BANNER -->
      <section class="relative h-[450px] sm:h-[550px] flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none z-10"></div>
        <div class="absolute inset-0 z-0">
           <img src="assets/stadium-history-bg.jpg" class="w-full h-full object-cover grayscale opacity-30 scale-110" onerror="this.src='https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop'" />
        </div>
        <div class="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-transparent to-indigo-950 z-10"></div>
        
        <div class="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <div class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-400/10 backdrop-blur-xl border border-amber-400/20 mb-8 animate-in fade-in slide-in-from-bottom duration-700">
             <div class="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></div>
             <span class="text-amber-400 text-[10px] font-black uppercase tracking-[0.4em] italic">Tradição Centenária</span>
          </div>
          
          <h1 class="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            História do <span class="text-amber-400 italic font-black">Lobo</span>
          </h1>
          
          <p class="text-lg md:text-2xl text-slate-300/80 font-bold leading-relaxed max-w-3xl mx-auto drop-shadow italic animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            Desde 1908, forjando glórias e paixão no coração da Princesa do Sul. Conheça a trajetória épica do Esporte Clube Pelotas.
          </p>
        </div>

        <!-- Scroll Indicator -->
        <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-30 animate-bounce">
           <span class="text-[8px] font-black text-white uppercase tracking-widest">Explorar o Legado</span>
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400"><path d="m7 13 5 5 5-5M7 6l5 5 5-5"/></svg>
        </div>
      </section>

      <!-- Main Content / Timeline -->
      <main class="max-w-6xl mx-auto px-4 py-32 relative">
        <!-- Vertical Timeline Line -->
        <div class="absolute left-1/2 top-40 bottom-20 w-[1px] bg-gradient-to-b from-amber-400/0 via-amber-400/20 to-amber-400/0 -translate-x-1/2 hidden md:block"></div>

        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-32">
            <app-spinner size="lg"></app-spinner>
            <p class="mt-6 text-slate-400 font-black uppercase tracking-widest text-xs italic">Resgatando memórias...</p>
          </div>
        } @else if (sections().length === 0) {
          <div class="text-center py-32 bg-white/5 backdrop-blur-xl rounded-[4rem] border border-white/5">
             <div class="w-16 h-16 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400 opacity-40"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
             </div>
             <p class="text-white font-black text-xl uppercase italic tracking-tighter">A história está sendo escrita...</p>
             <p class="text-slate-500 text-xs font-bold uppercase mt-2 tracking-widest">Em breve novos capítulos serão revelados</p>
          </div>
        } @else {
          <div class="space-y-48">
            @for (section of sections(); track section.id; let i = $index) {
              <div 
                class="relative flex flex-col md:flex-row items-center gap-16 group"
                [class.md:flex-row-reverse]="i % 2 !== 0"
              >
                <!-- Timeline Dot Pin -->
                <div class="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-indigo-950 border-4 border-amber-400 z-30 hidden md:block group-hover:scale-125 transition-all duration-700 shadow-[0_0_20px_rgba(250,204,21,0.4)]">
                   <div class="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-20"></div>
                </div>

                <!-- Image Side -->
                <div class="w-full md:w-1/2 animate-in fade-in slide-in-from-{{ i % 2 === 0 ? 'left' : 'right' }}-16 duration-1000">
                  <div class="relative rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] aspect-[4/3] group-hover:shadow-amber-400/20 transition-all duration-1000 group-hover:-translate-y-2 group-hover:scale-[1.02]">
                    <img [src]="section.coverImageUrl || 'assets/placeholder-history.jpg'" class="w-full h-full object-cover transition-all duration-1000 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100" onerror="this.src='https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1000&auto=format&fit=crop'" />
                    <div class="absolute inset-0 bg-gradient-to-t from-indigo-950/60 via-transparent to-transparent opacity-60"></div>
                  </div>
                </div>

                <!-- Text Content Side -->
                <div class="w-full md:w-1/2 space-y-6 animate-in fade-in slide-in-from-{{ i % 2 === 0 ? 'right' : 'left' }}-16 duration-1000">
                  <div class="flex items-center gap-6 mb-2">
                    <div class="h-[2px] flex-1 bg-gradient-to-r from-transparent to-white/10 md:hidden"></div>
                    <div class="px-5 py-1.5 bg-amber-400/10 backdrop-blur-md rounded-xl border border-amber-400/20">
                       <span class="text-amber-400 font-black text-2xl italic tracking-tighter shadow-amber-400/20">
                         {{ section.year || ('Etapa ' + (i + 1)) }}
                       </span>
                    </div>
                    <div class="h-[2px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                  </div>
                  
                  <h2 class="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter transition-all duration-500 group-hover:text-amber-400 italic">
                    {{ section.title }}
                  </h2>
                  
                  <div class="prose prose-invert max-w-none prose-p:text-slate-400 prose-p:font-bold prose-p:leading-relaxed prose-headings:text-amber-400">
                    @if (section.format === 'BLOCKS') {
                      <div [innerHTML]="parseBlocks(section.content)"></div>
                    } @else {
                      <div [innerHTML]="section.content"></div>
                    }
                  </div>

                  <div class="pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                     <div class="h-1 w-12 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </main>

      <!-- CTA Footer (Modernized) -->
      <section class="max-w-5xl mx-auto px-4 pb-32">
         <div class="relative bg-white/5 backdrop-blur-2xl rounded-[4rem] border border-white/10 p-12 md:p-24 text-center overflow-hidden group">
            <div class="absolute -top-24 -left-24 w-64 h-64 bg-amber-400 opacity-5 blur-[100px] group-hover:opacity-10 transition-opacity duration-1000"></div>
            <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-sky-400 opacity-5 blur-[100px] group-hover:opacity-10 transition-opacity duration-1000"></div>
            
            <div class="relative z-10">
               <h2 class="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter italic uppercase">O Lobo <span class="text-amber-400">Nunca</span> Para de Lutar.</h2>
               <p class="text-slate-400 font-bold text-lg max-w-2xl mx-auto mb-12 italic leading-relaxed">
                 A história continua sendo escrita por cada torcedor@if (isMembershipEnabled()) {, cada sócio} e cada atleta que veste com orgulho o manto áureo-cerúleo.
               </p>
               <div class="flex flex-wrap justify-center gap-6">
                  @if (isMembershipEnabled()) {
                    <a routerLink="/seja-socio" class="group/btn relative px-10 py-5 bg-amber-400 text-indigo-950 font-black rounded-2xl hover:bg-white transition-all shadow-[0_20px_50px_rgba(250,204,21,0.2)] active:scale-95 flex items-center gap-3">
                       SEJA SÓCIO DO LOBO
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="group-hover/btn:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </a>
                  }
               </div>
            </div>
         </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .prose ::ng-deep p { font-weight: 700 !important; color: rgba(148, 163, 184, 0.9) !important; font-style: italic; margin-bottom: 1.5rem; line-height: 1.8; font-size: 0.95rem; }
    .prose ::ng-deep h2 { font-weight: 900; color: #fbbf24 !important; margin-top: 2rem; font-style: italic; font-size: 1.5rem; text-transform: uppercase; letter-spacing: -0.025em; }
    .prose ::ng-deep h3 { font-weight: 900; color: #fbbf24 !important; margin-top: 1.5rem; font-style: italic; }
  `]
})
export class HistoryPageComponent implements OnInit {
  private readonly historyApi = inject(HistoryApiService);
  private readonly appSettings = inject(AppSettingsService);
  readonly sections = signal<History[]>([]);
  readonly loading = signal<boolean>(true);
  readonly isMembershipEnabled = this.appSettings.isMembershipEnabled;

  ngOnInit() {
    this.historyApi.listPublic().subscribe({
      next: (data: History[]) => {
        this.sections.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  parseBlocks(content: any): string {
    if (!content || !content.blocks) return '';
    return content.blocks.map((block: any) => {
      switch (block.type) {
        case 'header':
          return `<h${block.data.level} class="text-xl md:text-2xl font-black text-amber-400 mt-8 mb-4 uppercase italic tracking-tighter">${block.data.text}</h${block.data.level}>`;
        case 'paragraph':
          return `<p class="mb-5 text-slate-400 font-bold leading-relaxed italic text-sm md:text-base">${block.data.text}</p>`;
        case 'list':
          const items = block.data.items.map((item: string) => `<li class="ml-4 list-disc text-slate-500 font-black italic text-sm">${item}</li>`).join('');
          return `<ul class="mb-6 space-y-3">${items}</ul>`;
        case 'image':
          return `
            <figure class="my-12 relative group/img">
              <div class="absolute -inset-2 bg-gradient-to-r from-amber-400/20 to-sky-400/20 rounded-[2.5rem] blur opacity-0 group-hover/img:opacity-100 transition duration-700"></div>
              <img src="${block.data.file.url}" class="relative z-10 rounded-[2rem] shadow-2xl w-full object-cover aspect-video border border-white/5 transition-transform duration-700 group-hover/img:scale-[1.01]" alt="${block.data.caption || ''}">
              ${block.data.caption ? `<figcaption class="text-center text-[10px] text-amber-400/40 mt-4 font-black uppercase tracking-[0.3em] italic">${block.data.caption}</figcaption>` : ''}
            </figure>
          `;
        default:
          return '';
      }
    }).join('');
  }
}
