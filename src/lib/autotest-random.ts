export type AutoTestAnswer = {
    text: string;
    isCorrect: boolean;
};

export type AutoTestQuestion = {
    id: string;
    prompt: string;
    explanation?: string;
    answers: AutoTestAnswer[];
};

export type AutoTestTopic = {
    title: string;
    description?: string;
    passingScore?: number;
    questions: AutoTestQuestion[];
};

export type AutoTestsMap = Record<string, AutoTestTopic>;

export function shuffleArray<T>(items: T[]): T[] {
    const copy = [...items];

    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

export function randomizeAutoTest(test: AutoTestTopic): AutoTestTopic {
    return {
        ...test,
        questions: shuffleArray(test.questions).map((question) => ({
            ...question,
            answers: shuffleArray(question.answers),
        })),
    };
}