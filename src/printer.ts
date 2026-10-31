import { Buffer } from 'buffer';
import * as SunmiPrinterLibrary from '@mitsuharu/react-native-sunmi-printer-library';

const UTF8_COMMAND = new Uint8Array([0x1c, 0x26, 0x1c, 0x43, 0xff]);

let ready = false;

export async function initPrinter(useUtf8: boolean): Promise<void> {
  await SunmiPrinterLibrary.prepare();

  if (useUtf8) {
    await SunmiPrinterLibrary.sendRAWData(Buffer.from(UTF8_COMMAND).toString('base64'));
  }

  ready = true;
}

export function isPrinterReady(): boolean {
  return ready;
}

export async function printLines(lines: string[]): Promise<void> {
  if (!ready) {
    throw new Error('Imprimante non initialisee');
  }

  await SunmiPrinterLibrary.enterPrinterBuffer(true);

  try {
    await SunmiPrinterLibrary.setAlignment('left');

    for (const line of lines) {
      await SunmiPrinterLibrary.printText(`${line}\n`);
    }

    await SunmiPrinterLibrary.lineWrap(4);
  } finally {
    await SunmiPrinterLibrary.exitPrinterBuffer(true);
  }
}
