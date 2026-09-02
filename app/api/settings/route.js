import { NextResponse } from 'next/server';
import { getSettingsFromSheet } from '../../../lib/googleSheets';

export async function GET() {
  try {
    const settings = await getSettingsFromSheet();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load settings' },
      { status: 500 }
    );
  }
}
