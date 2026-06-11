import Wallpaper from './Wallpaper';
import Todo from './Todo';
import Note from './Note';
import Music from './Music';
import Calendar from './Calendar';
import Pomodoro from './Pomodoro';

export default function Grid() {
  return (
    <div className="w-screen h-screen p-4 overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
      <div
        className="grid gap-4 h-full"
        style={{
          gridTemplateColumns: '1fr 1.4fr 1fr',
          gridTemplateRows: '1fr 1fr 1fr',
        }}
      >
        {/* Wallpaper — col 1, rows 1-2 */}
        <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ gridColumn: '1', gridRow: '1 / 3' }}>
          <Wallpaper />
        </div>

        {/* Todo — col 2, rows 1-2 */}
        <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ gridColumn: '2', gridRow: '1 / 3' }}>
          <Todo />
        </div>

        {/* Profile — col 3, row 1 */}
        <div
          className="rounded-3xl px-5 py-4 shadow-2xl flex items-center gap-4"
          style={{ gridColumn: '3', gridRow: '1', backgroundColor: '#242424', border: '1px solid #333' }}
        >
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0" style={{ border: '2px solid #444' }}>
            <div className="w-full h-full flex items-center justify-center text-2xl" style={{ backgroundColor: '#333' }}>👤</div>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Smriti Singh</p>
            <p className="text-xs" style={{ color: '#888' }}>xyz@gmail.com</p>
          </div>
        </div>

        {/* Note — col 3, row 2 */}
        <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ gridColumn: '3', gridRow: '2' }}>
          <Note />
        </div>

        {/* Music — col 1, row 3 */}
        <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ gridColumn: '1', gridRow: '3' }}>
          <Music />
        </div>

        {/* Calendar — col 2, row 3 */}
        <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ gridColumn: '2', gridRow: '3' }}>
          <Calendar />
        </div>

        {/* Pomodoro — col 3, row 3 */}
        <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ gridColumn: '3', gridRow: '3' }}>
          <Pomodoro />
        </div>

        {/* Screen Time + Reminders — col 4, row 3 */}
        <div
          className="rounded-3xl shadow-2xl flex flex-col gap-3 p-3"
          style={{ gridColumn: '3', gridRow: '3', backgroundColor: '#1a1a1a' }}
        >
          <div className="flex-1 rounded-2xl overflow-hidden">
            <Pomodoro />
          </div>
          <div className="flex gap-3" style={{ height: '72px' }}>
            <div className="flex-1 rounded-2xl flex flex-col items-center justify-center" style={{ backgroundColor: '#242424' }}>
              <p className="text-xs tracking-widest mb-1" style={{ color: '#666' }}>SCREEN TIME</p>
              <p className="text-2xl font-bold text-white leading-none">
                <span style={{ color: '#e84040' }}>2</span> hrs
              </p>
            </div>
            <div className="flex-1 rounded-2xl p-3 overflow-y-auto" style={{ backgroundColor: '#1a2535' }}>
              <p className="text-xs font-semibold text-white mb-2">Upcoming reminder :</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold" style={{ color: '#e05050' }}>04:30</span>
                  <span style={{ color: '#8090b0' }}>wake up</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-bold" style={{ color: '#e05050' }}>10:05</span>
                  <span style={{ color: '#8090b0' }}>homework</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}