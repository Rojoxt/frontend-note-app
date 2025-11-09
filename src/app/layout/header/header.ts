import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, LayoutModule],
  template: `
    <!-- mat-menu only for small screens (rendered only when isMobile) -->

      <mat-menu #menu="matMenu">
        <button mat-menu-item routerLink="/notes">Home</button>
        <button mat-menu-item routerLink="/notes/archived">Archived</button>
      </mat-menu>


    <mat-toolbar class="mat-elevation-z4 relative-toolbar app-toolbar">
      <div class="container mx-auto flex items-center justify-between px-4">
        <div class="flex items-center gap-3">
          <button *ngIf="isMobile" mat-icon-button class="p-0 md:hidden" aria-label="Open menu" [matMenuTriggerFor]="menu">
            <mat-icon>menu</mat-icon>
          </button>

          <span class="material-icons hidden md:inline">note</span>
          <span class="sr-only">Notes</span>
          <span class="app-title text-white font-semibold ml-2">My Notes</span>
        </div>

        <div class="flex items-center gap-3">
          <nav id="top-nav" class="hidden md:flex gap-4 ml-4">
            <button mat-button routerLink="/notes" class="nav-link text-white">Home</button>
            <button mat-button routerLink="/notes/archived" class="nav-link text-white">Archived</button>
          </nav>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles:`
    .app-toolbar { padding: 0.25rem 0; }
    .app-title { font-size: 1.125rem; letter-spacing: 0.2px; }

    @media (max-width: 767px) {
      .app-toolbar .container { display: flex; align-items: center; justify-content: center; }
      .app-toolbar .container .app-title { position: absolute; left: 50%; transform: translateX(-50%); }
      .app-toolbar .container button[mat-icon-button] { position: absolute; left: 0.75rem; }
      nav#top-nav { display: none !important; }
    }

    @media (min-width: 768px) {
      .app-toolbar .container { justify-content: space-between; }
      nav#top-nav { display: flex !important; }
    }

    /* Use fallback color if CSS variable is not resolved by analyzer */
    .nav-link { color: var(--toolbar-text, #ffffff); text-decoration: none; }

    /* Specific selector for mat-icon inside the toolbar */
    .app-toolbar mat-icon { color: var(--toolbar-text, #ffffff); }
  `
})
export class Header implements OnDestroy {
  menu: any = null; // template reference placeholder for mat-menu
  isMobile = false;
  private _bpSub?: Subscription;

  constructor(private breakpointObserver: BreakpointObserver) {
    this._bpSub = this.breakpointObserver.observe(['(max-width: 767px)']).subscribe(result => {
      this.isMobile = result.matches;
    });
  }

  ngOnDestroy(): void {
    this._bpSub?.unsubscribe();
  }
}
