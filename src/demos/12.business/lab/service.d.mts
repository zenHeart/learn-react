export type Ticket = { id: string; title: string; priority: 'normal' | 'urgent'; status: 'open' | 'done'; version: number }
export class TicketError extends Error { status: number; constructor(status: number, message: string) }
export function createTicketService(): {
  list(): Ticket[];
  create(input: { title: string; priority: Ticket['priority'] }, key: string): { ticket: Ticket; replayed: boolean };
  transition(id: string, status: Ticket['status'], expectedVersion: number): Ticket;
}
