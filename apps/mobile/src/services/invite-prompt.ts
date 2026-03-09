import AsyncStorage from "@react-native-async-storage/async-storage";

const INVITE_KEY = "bighead_invite_prompt";
const FIRST_MILESTONE = 5;
const MILESTONE_INCREMENT = 15;

interface InviteState {
  winsCount: number;
  nextMilestone: number;
  lastShown: string | null;
}

const defaultState: InviteState = {
  winsCount: 0,
  nextMilestone: FIRST_MILESTONE,
  lastShown: null,
};

export const getInviteState = async (): Promise<InviteState> => {
  try {
    const raw = await AsyncStorage.getItem(INVITE_KEY);
    return raw ? JSON.parse(raw) : defaultState;
  } catch {
    return defaultState;
  }
};

const saveInviteState = async (state: InviteState) => {
  await AsyncStorage.setItem(INVITE_KEY, JSON.stringify(state));
};

export const incrementWins = async () => {
  const state = await getInviteState();
  state.winsCount++;
  await saveInviteState(state);
};

export const shouldShowInvitePrompt = async (): Promise<boolean> => {
  const state = await getInviteState();
  if (state.winsCount < state.nextMilestone) return false;

  // Don't show more than once per day
  if (state.lastShown) {
    const lastDate = new Date(state.lastShown).toDateString();
    const today = new Date().toDateString();
    if (lastDate === today) return false;
  }

  return true;
};

export const markInviteShown = async () => {
  const state = await getInviteState();
  state.lastShown = new Date().toISOString();
  await saveInviteState(state);
};

export const markInviteDismissed = async () => {
  const state = await getInviteState();
  state.nextMilestone = state.winsCount + MILESTONE_INCREMENT;
  state.lastShown = new Date().toISOString();
  await saveInviteState(state);
};
