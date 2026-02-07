import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma as db } from "@/lib/db";

// Generate iCal format for Google Calendar integration
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const user = session.user as any;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'ical';
    
    // Get events for user's school
    const events = await db.event.findMany({
      where: {
        schoolId: user.schoolId,
        startDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      },
      orderBy: { startDate: 'asc' },
      take: 100
    });
    
    if (format === 'json') {
      // Return JSON for client-side calendar
      return NextResponse.json(events.map((e: any) => ({
        id: e.id,
        title: e.title,
        start: e.startDate.toISOString(),
        end: e.endDate?.toISOString() || e.startDate.toISOString(),
        description: e.description,
        type: e.type,
        allDay: e.allDay
      })));
    }
    
    // Generate iCal format
    const school = await db.school.findUnique({
      where: { id: user.schoolId },
      select: { name: true }
    });
    
    const formatDate = (date: Date, allDay: boolean) => {
      if (allDay) {
        return date.toISOString().split('T')[0].replace(/-/g, '');
      }
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const escapeText = (text: string | null) => {
      if (!text) return '';
      return text.replace(/[\\,;]/g, '\\$&').replace(/\n/g, '\\n');
    };
    
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//IA School//Calendar//ES',
      `X-WR-CALNAME:${school?.name || 'IA School'}`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];
    
    for (const event of events) {
      const uid = `${event.id}@iaschool.edu`;
      const dtstart = event.allDay 
        ? `DTSTART;VALUE=DATE:${formatDate(event.startDate, true)}`
        : `DTSTART:${formatDate(event.startDate, false)}`;
      const dtend = event.endDate
        ? (event.allDay 
            ? `DTEND;VALUE=DATE:${formatDate(event.endDate, true)}`
            : `DTEND:${formatDate(event.endDate, false)}`)
        : dtstart.replace('DTSTART', 'DTEND');
      
      icalContent.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${formatDate(new Date(), false)}`,
        dtstart,
        dtend,
        `SUMMARY:${escapeText(event.title)}`,
        event.description ? `DESCRIPTION:${escapeText(event.description)}` : '',
        event.location ? `LOCATION:${escapeText(event.location)}` : '',
        `CATEGORIES:${event.type}`,
        'END:VEVENT'
      );
    }
    
    icalContent.push('END:VCALENDAR');
    
    const ical = icalContent.filter(line => line).join('\r\n');
    
    return new NextResponse(ical, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="iaschool-calendar.ics"'
      }
    });
    
  } catch (error) {
    console.error("Error generating calendar:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
