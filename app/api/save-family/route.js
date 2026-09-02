import { NextResponse } from 'next/server';
import { saveFamilyToSheet } from '../../../lib/googleSheets';

export async function POST(request) {
  try {
    const data = await request.json();
    const result = await saveFamilyToSheet(data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving family survey:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to save family information' },
      { status: 400 }
    );
  }
}
