// Math Quiz Generator and Logic
class MathQuizEngine {
  constructor() {
    this.currentQuiz = null;
  }

  // Generate question based on towersPassed and streak
  generateQuiz(towersPassed, streak = 0) {
    // Number of options scaling:
    // < 10 towers: 2 options
    // 10 - 19 towers: 3 options
    // >= 20 towers: 4 options (max 4)
    let optionCount = 2;
    if (towersPassed >= 20) {
      optionCount = 4;
    } else if (towersPassed >= 10) {
      optionCount = 3;
    }

    // Variasikan soal (+, -, *, /) selalu tersedia dengan bobot berimbang
    // Pilihan operasi acak dengan probabilitas seimbang
    const allOps = ['+', '-', '*', '/'];
    const op = allOps[Math.floor(Math.random() * allOps.length)];

    let num1, num2, answer, questionText;

    if (op === '+') {
      // Numbers 1 to 100
      const max = Math.min(100, 30 + towersPassed * 4 + streak * 2);
      num1 = Math.floor(Math.random() * (max - 5)) + 3;
      num2 = Math.floor(Math.random() * (max - num1)) + 2;
      answer = num1 + num2;
      questionText = `${num1} + ${num2}`;
    } else if (op === '-') {
      // Numbers 1 to 100
      const max = Math.min(100, 35 + towersPassed * 4 + streak * 2);
      num1 = Math.floor(Math.random() * (max - 10)) + 10;
      num2 = Math.floor(Math.random() * (num1 - 2)) + 1;
      answer = num1 - num2;
      questionText = `${num1} - ${num2}`;
    } else if (op === '*') {
      // Multiplication 1 to 50 max product, clean mental math
      const maxFactor = towersPassed >= 15 ? 12 : 9;
      num1 = Math.floor(Math.random() * (maxFactor - 2)) + 2; // 2..maxFactor
      const maxNum2 = Math.min(10, Math.floor(50 / num1));
      num2 = Math.max(2, Math.floor(Math.random() * (maxNum2 - 1)) + 2);
      answer = num1 * num2;
      questionText = `${num1} × ${num2}`;
    } else {
      // Division: 1 to 50 dividend, clean integer result
      num2 = Math.floor(Math.random() * 7) + 2; // divisor 2..8
      const maxQuotient = Math.floor(50 / num2);
      answer = Math.floor(Math.random() * (maxQuotient - 1)) + 2;
      num1 = num2 * answer;
      questionText = `${num1} ÷ ${num2}`;
    }

    // Generate wrong options (believable distractors)
    const optionsSet = new Set([answer]);
    while (optionsSet.size < optionCount) {
      let offset = Math.floor(Math.random() * 9) - 4; // -4 to +4
      if (offset === 0) offset = Math.random() < 0.5 ? 1 : -1;
      
      // Typical mental math trap offsets
      if (Math.random() < 0.35) {
        offset = Math.random() < 0.5 ? 10 : -10;
      }

      let wrongAns = answer + offset;
      if (wrongAns <= 0) wrongAns = answer + Math.abs(offset) + 2;
      
      optionsSet.add(wrongAns);
    }

    // Shuffle options
    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    this.currentQuiz = {
      num1,
      num2,
      operator: op,
      questionText,
      correctAnswer: answer,
      options,
      optionCount
    };

    return this.currentQuiz;
  }

  validateAnswer(userAnswer) {
    if (!this.currentQuiz) return false;
    const num = parseInt(userAnswer, 10);
    return num === this.currentQuiz.correctAnswer;
  }
}

window.mathEngine = new MathQuizEngine();
