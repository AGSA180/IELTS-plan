export function playTTS(text: string, rate: number = 0.9, preferredAccent?: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel(); // stop current
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  
  const voices = window.speechSynthesis.getVoices();
  let voice;
  
  if (preferredAccent) {
    voice = voices.find(v => v.lang === preferredAccent);
  }
  
  // Fallback to British or Australian if preferred not found or not provided
  if (!voice) {
    voice = voices.find(v => v.lang === 'en-GB' || v.lang === 'en-AU');
  }
  
  if (voice) {
    utterance.voice = voice;
  }
  
  window.speechSynthesis.speak(utterance);
}

export function stopTTS() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
