import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Message } from '../services/messages.service';

export function getDateSeparatorLabel(date: Date): string {
  if (isToday(date)) {
    return "Aujourd'hui";
  }
  if (isYesterday(date)) {
    return 'Hier';
  }
  return format(date, 'd MMMM yyyy', { locale: fr });
}

export function shouldShowDateSeparator(currentMessage: Message, previousMessage?: Message): boolean {
  if (!previousMessage) return true;
  
  const currentDate = new Date(currentMessage.created_at);
  const previousDate = new Date(previousMessage.created_at);
  
  return !isSameDay(currentDate, previousDate);
}

export interface MessageGroup {
  date: Date;
  label: string;
  messages: Message[];
}

export function groupMessagesByDate(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  
  messages.forEach((message) => {
    const messageDate = new Date(message.created_at);
    const existingGroup = groups.find(g => isSameDay(g.date, messageDate));
    
    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groups.push({
        date: messageDate,
        label: getDateSeparatorLabel(messageDate),
        messages: [message]
      });
    }
  });
  
  return groups;
}


