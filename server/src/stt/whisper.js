import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

// Local Whisper STT placeholder module.
// This function will try to call a local `whisper` CLI if present.
// If not present, it returns a placeholder transcription. This avoids any
// external OpenAI API calls.
async function transcribeBuffer(buffer) {
  const tmpDir = os.tmpdir();
  const inPath = path.join(tmpDir, `lm_in_${Date.now()}_${Math.random().toString(36).slice(2,6)}.webm`);
  const outTxt = path.join(tmpDir, `lm_txt_${Date.now()}_${Math.random().toString(36).slice(2,6)}.txt`);

  try {
    fs.writeFileSync(inPath, Buffer.from(buffer));

    // Check for a local `whisper` CLI or a python -m whisper installation.
    const checkCommands = [
      ['whisper', '--version'],
      ['python', '-m', 'whisper', '--version'],
      ['python3', '-m', 'whisper', '--version']
    ];

    let foundCmd = null;
    for (const cmd of checkCommands) {
      try {
        const res = spawnSync(cmd[0], cmd.slice(1), { encoding: 'utf8' });
        if (!res.error && (res.status === 0 || res.status === null)) {
          foundCmd = cmd;
          break;
        }
      } catch (e) {
        // continue
      }
    }

    if (foundCmd) {
      try {
        // Build arguments for execution. If foundCmd starts with 'whisper' it's direct, otherwise use python -m whisper
        let res;
        if (foundCmd[0] === 'whisper') {
          const args = [inPath, '--model', 'small', '--output_format', 'txt', '--output_dir', tmpDir];
          res = spawnSync('whisper', args, { encoding: 'utf8', timeout: 120000 });
        } else {
          // python -m whisper
          const py = foundCmd[0];
          const args = ['-m', 'whisper', inPath, '--model', 'small', '--output_format', 'txt', '--output_dir', tmpDir];
          res = spawnSync(py, args, { encoding: 'utf8', timeout: 120000 });
        }

        if (res.error) {
          console.error('local whisper execution error', res.error);
        }

        // try to find generated txt file (some CLIs produce <audio>.txt)
        const baseName = path.basename(inPath, path.extname(inPath));
        const candidate = path.join(tmpDir, `${baseName}.txt`);
        let text = '';
        if (fs.existsSync(candidate)) {
          text = fs.readFileSync(candidate, 'utf8');
        } else if (fs.existsSync(outTxt)) {
          text = fs.readFileSync(outTxt, 'utf8');
        } else if (res && res.stdout) {
          text = String(res.stdout).trim().split('\n').slice(-1)[0] || '';
        }

        console.log('local whisper used:', foundCmd.join(' '), 'transcribed length:', (text || '').length);
        return { text: text || '[unrecognized audio]', language: 'auto' };
      } catch (err) {
        console.error('error running local whisper:', err);
        return { text: '[transcription failed - local whisper error]', language: 'unknown' };
      }
    }

    // If no local whisper available, return a placeholder so the pipeline remains functional.
    console.warn('local whisper CLI not found; returning placeholder transcription. Install a local whisper tool for real STT.');
    return { text: '[transcription unavailable - local whisper not installed]', language: 'unknown' };
  } catch (err) {
    console.error('transcribeBuffer error:', err.message || err);
    return { text: '', language: 'unknown' };
  } finally {
    try { if (fs.existsSync(inPath)) fs.unlinkSync(inPath); } catch (e) {}
    try { if (fs.existsSync(outTxt)) fs.unlinkSync(outTxt); } catch (e) {}
  }
}

export { transcribeBuffer };
