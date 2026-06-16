import type { GroupParticipant } from 'baileys';
import type { BotSocket } from './helpers.js';
import { extractPhoneNumber, normalizeParticipantId } from './jid.js';

function participantMatches(participant: GroupParticipant, target: string): boolean {
  const normalizedTarget = normalizeParticipantId(target)?.toLowerCase();
  const targetNumber = extractPhoneNumber(target);

  const ids = [participant.id, participant.lid, participant.phoneNumber]
    .filter(Boolean)
    .map((value) => normalizeParticipantId(value!)!.toLowerCase());

  if (normalizedTarget && ids.includes(normalizedTarget)) {
    return true;
  }

  if (!targetNumber) return false;

  return ids.some((id) => extractPhoneNumber(id) === targetNumber);
}

export async function findParticipant(
  sock: BotSocket,
  groupId: string,
  target: string,
): Promise<GroupParticipant | undefined> {
  const metadata = await sock.groupMetadata(groupId);
  return metadata.participants.find((participant) => participantMatches(participant, target));
}

export async function findParticipants(
  sock: BotSocket,
  groupId: string,
  targets: string[],
): Promise<GroupParticipant[]> {
  const metadata = await sock.groupMetadata(groupId);
  const found = new Map<string, GroupParticipant>();

  for (const target of targets) {
    const participant = metadata.participants.find((entry) => participantMatches(entry, target));
    if (participant?.id) {
      found.set(participant.id, participant);
    }
  }

  return [...found.values()];
}
