import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signal para rastrear si el modo oscuro está activo
  darkMode = signal<boolean>(false);

  constructor() {
    // 1. Revisa si el usuario ya eligió un modo antes o si el sistema operativo está en oscuro
    const guardado = localStorage.getItem('theme');
    const prefiereOscuroSistema = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.darkMode.set(guardado === 'dark' || (!guardado && prefiereOscuroSistema));

    // 2. Este efecto se ejecuta automáticamente cada vez que 'darkMode' cambia
    effect(() => {
      const raiz = document.documentElement; // La etiqueta <html> de tu app
      if (this.darkMode()) {
        raiz.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        raiz.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  // Método para cambiar de modo (Claro <-> Oscuro)
  toggleTheme() {
    this.darkMode.update(modo => !modo);
  }
}
