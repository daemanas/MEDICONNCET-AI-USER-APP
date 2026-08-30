import {aiApi} from '../api/syncApi';
import {runScreenAction, runTool} from './aiTools';
import {detectLocalIntent} from './intentService';

const session = [];

export function getAiHistory() {
  return [...session];
}

export function clearAiHistory() {
  session.length = 0;
}

export async function sendAiMessage(message) {
  const text = String(message || '').trim();
  if (!text) {
    return {text: 'Please tell me what you need help with.', actions: []};
  }
  session.push({role: 'user', content: text});
  let reply;
  try {
    reply = await aiApi.chat({message: text, history: session.slice(-10)});
  } catch {
    const intent = detectLocalIntent(text);
    reply = {
      text: 'I can help you find care in the app. I am not a doctor and I do not diagnose.',
      actions: [{type: 'navigate', screen: intent.screen, tool: intent.tool, params: intent.params}],
      speak: true,
    };
  }
  session.push({role: 'assistant', content: reply.text});
  return reply;
}

export function applyAiActions(reply) {
  const actions = reply?.actions || [];
  for (const action of actions) {
    if (action.tool) {
      runTool(action.tool, action.params);
    } else if (action.screen) {
      runScreenAction(action.screen, action.params);
    }
  }
}
