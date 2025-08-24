import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-team-score',
  standalone: true,
  templateUrl: './team-score.html',
  styleUrls: ['./team-score.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamScoreComponent {
  @Input({ required: true }) name!: string;
  @Input({ required: true }) score!: number;
  @Input({ required: true }) fouls!: number;
}
