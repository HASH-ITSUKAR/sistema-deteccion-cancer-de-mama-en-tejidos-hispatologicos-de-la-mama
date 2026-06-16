import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  model
} from '@angular/core';

import { SideMenuHeader } from './side-menu-header/side-menu-header';
import { SideMenuLanguage } from './side-menu-language/side-menu-language';
import { SideMenuOptions } from './side-menu-options/side-menu-options';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [
    SideMenuHeader,
    SideMenuLanguage,
    SideMenuOptions
  ],
  templateUrl: './side-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideMenu {

  isOpen = model<boolean>(window.innerWidth >= 768);

  private touchStartX = 0;
  private touchEndX = 0;

  private readonly threshold = 80;
  private readonly edgeSize = 30;

  readonly isMobileView = () => window.innerWidth < 768;

  toggleMenu(): void {
    this.isOpen.update(state => !state);
  }

  closeMenu(): void {
    this.isOpen.set(false);
  }

  private isMobile(): boolean {
    return window.innerWidth < 768;
  }

  @HostListener('document:touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {

    if (!this.isMobile()) {
      return;
    }

    const x = event.touches[0].clientX;

    // Si el menú está cerrado, el gesto debe iniciar
    // cerca del borde izquierdo.
    if (!this.isOpen() && x > this.edgeSize) {
      return;
    }

    this.touchStartX = x;
    this.touchEndX = x;
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {

    if (!this.isMobile() || this.touchStartX === 0) {
      return;
    }

    this.touchEndX = event.touches[0].clientX;
  }

  @HostListener('document:touchend')
  onTouchEnd(): void {

    if (!this.isMobile() || this.touchStartX === 0) {
      return;
    }

    const distance = this.touchEndX - this.touchStartX;

    // Abrir menú
    if (!this.isOpen() && distance > this.threshold) {
      this.isOpen.set(true);
    }

    // Cerrar menú
    if (this.isOpen() && distance < -this.threshold) {
      this.isOpen.set(false);
    }

    this.touchStartX = 0;
    this.touchEndX = 0;
  }
}
