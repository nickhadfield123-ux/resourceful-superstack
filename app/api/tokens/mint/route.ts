import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, amount } = body;

    if (!address || !amount) {
      return NextResponse.json(
        { error: 'Missing address or amount' },
        { status: 400 }
      );
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: true,
      txHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
      amount: Number(amount),
      address,
      blockNumber: Math.floor(Math.random() * 1000000),
      gasUsed: '21000',
      duration: '1500ms'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Minting failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
