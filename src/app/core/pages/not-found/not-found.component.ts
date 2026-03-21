import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-24 sm:py-32 lg:px-8 font-sans">
      <div class="text-center">
        <p class="text-base font-semibold text-cyan-600">404</p>
        <h1 class="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">Página não encontrada</h1>
        <p class="mt-6 text-base leading-7 text-slate-600">Desculpe, não conseguimos encontrar a página que você está procurando ou ela pode estar indisponível.</p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <a routerLink="/" class="rounded-md bg-cyan-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600">Voltar para o Início</a>
          <a routerLink="/app/me" class="text-sm font-semibold text-slate-900">Ir para o Painel <span aria-hidden="true">&rarr;</span></a>
        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
