import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase/admin';
import { sendEmail } from '@/lib/email';

// This would typically be hit by a CRON job (e.g. Vercel Cron, Google Cloud Scheduler)
// We use a simple auth token to verify the caller
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find scheduled letters for today or earlier
    const snapshot = await adminDb.collection('futureLetters')
      .where('status', '==', 'scheduled')
      .where('targetDate', '<=', today)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ message: 'No letters to send' });
    }

    const batch = adminDb.batch();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Get user details
      const userDoc = await adminDb.doc(`users/${data.userId}`).get();
      const userData = userDoc.data();

      // 1. Send via Email using Gmail SMTP
      if (userData?.email) {
        try {
          const sealDate = data.createdAt?.toDate?.() 
            ? data.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

          await sendEmail({
            to: userData.email,
            subject: 'A Letter from Your Past Self 💌',
            text: `Hello!\n\nHere is the letter you wrote to yourself, scheduled to be delivered today:\n\n---\n\n${data.content}\n\n---\n\nSealed on: ${sealDate}\nSent with love,\nLifeSaver`,
            html: `
              <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <span style="font-size: 40px;">💌</span>
                  <h1 style="font-size: 24px; font-weight: 700; color: #6d28d9; margin: 8px 0 0 0;">A Letter from Your Past Self</h1>
                  <p style="font-size: 14px; color: #64748b; margin: 4px 0 0 0;">Written by you, for you</p>
                </div>
                
                <div style="background-color: #f8fafc; border-left: 4px solid #8b5cf6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                  <div style="font-size: 16px; line-height: 1.6; color: #334155; white-space: pre-wrap; font-style: italic;">
                    ${data.content}
                  </div>
                </div>
                
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                
                <div style="text-align: center; font-size: 12px; color: #94a3b8;">
                  <p style="margin: 0 0 4px 0;">This letter was sealed on <strong>${sealDate}</strong>.</p>
                  <p style="margin: 0;">Sent automatically by <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="color: #8b5cf6; text-decoration: none; font-weight: 500;">LifeSaver</a></p>
                </div>
              </div>
            `,
          });
        } catch (e) {
          console.error(`Failed to send email to user ${data.userId} (${userData?.email})`, e);
        }
      }

      // 2. Send Push Notification via FCM
      if (userData?.fcmTokens && userData.fcmTokens.length > 0) {
        const message = {
          notification: {
            title: 'A Letter from Your Past Self 💌',
            body: 'Your future self letter has arrived. Tap to read.',
          },
          tokens: userData.fcmTokens,
        };

        try {
          await adminMessaging.sendEachForMulticast(message);
        } catch (e) {
          console.error(`Failed to send FCM to user ${data.userId}`, e);
        }
      }

      batch.update(doc.ref, {
        status: 'delivered',
        deliveredAt: new Date(),
      });
    }

    await batch.commit();

    return NextResponse.json({ success: true, count: snapshot.size });
  } catch (err) {
    console.error('[Send Future Letter Cron]', err);
    return NextResponse.json({ message: 'Failed to send letters' }, { status: 500 });
  }
}
