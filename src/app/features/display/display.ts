import { ChangeDetectionStrategy, Component, computed, inject, OnInit, OnDestroy, signal, effect, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { GameStore } from '../../core/game-store';
import { RealtimeService } from '../../core/realtime.service';
import { TeamsService, Team } from '../../core/teams.service';

@Component({
  standalone: true,
  selector: 'app-display',
  templateUrl: './display.html',
  styleUrls: ['./display.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayComponent implements OnInit, OnDestroy, AfterViewInit {
  private s = inject(GameStore);
  constructor(private rt: RealtimeService, private teams: TeamsService) { }

  ngOnInit() { void this.rt.connect('http://localhost:8080'); }
  ngOnDestroy() { void this.rt.disconnect(); }

  // ---- NUEVO: refs para medir puntaje y aplicar tamaño a logos
  @ViewChild('homeScore') homeScoreEl!: ElementRef<HTMLElement>;
  @ViewChild('awayScore') awayScoreEl!: ElementRef<HTMLElement>;
  @ViewChild('homeLogoBox') homeLogoBoxEl!: ElementRef<HTMLElement>;
  @ViewChild('awayLogoBox') awayLogoBoxEl!: ElementRef<HTMLElement>;

  ngAfterViewInit() {
    // primer cálculo
    this.syncLogoSizes();
    // recalcular cuando carguen/ cambien logos
    setTimeout(() => this.syncLogoSizes(), 0);
  }

  @HostListener('window:resize')
  onResize() { this.syncLogoSizes(); }

  private syncLogoSizes() {
    const setSize = (scoreEl?: ElementRef<HTMLElement>, boxEl?: ElementRef<HTMLElement>) => {
      if (!scoreEl?.nativeElement || !boxEl?.nativeElement) return;
      const fs = parseFloat(getComputedStyle(scoreEl.nativeElement).fontSize || '0'); // px
      const img = boxEl.nativeElement.querySelector('img') as HTMLImageElement | null;
      if (img && fs > 0) {
        img.style.width = `${fs}px`;
        img.style.height = `${fs}px`;
      }
    };
    setSize(this.homeScoreEl, this.homeLogoBoxEl);
    setSize(this.awayScoreEl, this.awayLogoBoxEl);
  }

  // ====== resto igual (estado, logos por nombre, banners, etc.) ======
  home = this.s.home; away = this.s.away;
  quarter = this.s.quarter; timeLabel = this.s.timeLabel;
  running = this.s.running; bonusHome = this.s.bonusHome; bonusAway = this.s.bonusAway;
  possession = this.s.possession; timeoutLabel = this.s.timeoutLabel;
  timeoutLeftMs = this.s.timeoutLeftMs; timeoutBy = this.s.timeoutBy;

  homeName = computed(() => (this.home().name ?? '').trim() || 'LOCAL');
  awayName = computed(() => (this.away().name ?? '').trim() || 'VISITA');
  homeLogo = signal<string>(''); awayLogo = signal<string>('');

  private logoEffect = effect(() => {
    const hn = this.homeName(); const an = this.awayName();
    if (hn && hn !== 'LOCAL') {
      this.teams.getAll(hn).subscribe({
        next: (list: Team[]) => {
          const t = (list ?? []).find(x => (x.name ?? '').trim().toLowerCase() === hn.toLowerCase());
          this.homeLogo.set(t?.logoUrl || ''); this.syncLogoSizes();
        }, error: () => { this.homeLogo.set(''); this.syncLogoSizes(); }
      });
    } else { this.homeLogo.set(''); this.syncLogoSizes(); }

    if (an && an !== 'VISITA') {
      this.teams.getAll(an).subscribe({
        next: (list: Team[]) => {
          const t = (list ?? []).find(x => (x.name ?? '').trim().toLowerCase() === an.toLowerCase());
          this.awayLogo.set(t?.logoUrl || ''); this.syncLogoSizes();
        }, error: () => { this.awayLogo.set(''); this.syncLogoSizes(); }
      });
    } else { this.awayLogo.set(''); this.syncLogoSizes(); }
  });

  showQuarterBanner = signal(false);
  endedQuarter = signal<1 | 2 | 3 | 4>(1);
  bannerText = computed(() => this.endedQuarter() === 4 ? 'FIN DEL PARTIDO' : `FIN Q${this.endedQuarter()}`);

  private _prevQuarter = this.quarter();
  private quarterChangeEffect = effect(() => {
    const q = this.quarter();
    const autoBetween = (q > this._prevQuarter) && !this.running() && (this.s.timeLeftMs() === this.s.quarterDurationMs());
    if (autoBetween) {
      this.endedQuarter.set(this._prevQuarter as 1 | 2 | 3 | 4);
      this.showQuarterBanner.set(true);
      setTimeout(() => this.showQuarterBanner.set(false), 2500);
    }
    this._prevQuarter = q;
  });

  private _prevTimeLeft = this.s.timeLeftMs();
  private finalGameEffect = effect(() => {
    const tl = this.s.timeLeftMs();
    const isEndQ4 = this.quarter() === 4 && !this.running() && this._prevTimeLeft > 0 && tl === 0;
    if (isEndQ4) {
      this.endedQuarter.set(4);
      this.showQuarterBanner.set(true);
      setTimeout(() => this.showQuarterBanner.set(false), 3000);
    }
    this._prevTimeLeft = tl;
  });
}
