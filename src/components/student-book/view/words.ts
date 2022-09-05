import WordsAPI from '../../../api/words-api';
import { BASE_URL } from '../../../constants';
import { IWord, IAggregatedWord, IUserWord } from '../../../types';
import DateFormatter from '../../../utils/date-formatter';
import UIElementsConstructor from '../../../utils/ui-elements-creator';
import AudioElement from '../../audio/audio-element';
import AuthController from '../../auth/auth-controller';
import RequestProcessor from '../../request-processor';
import UserWord from '../../user-word';
import WordProgressModal from './progress-modal';

export default class WordCard {
  private elementCreator: UIElementsConstructor;

  readonly authController: AuthController;

  readonly wordsAPI: WordsAPI;

  readonly requestProcessor: RequestProcessor;

  private difficult: 'easy' | 'hard';

  private isLearned: boolean;

  private dateFormatter: DateFormatter;

  constructor(private word: IWord | IAggregatedWord) {
    this.elementCreator = new UIElementsConstructor();
    this.authController = new AuthController();
    this.wordsAPI = new WordsAPI();
    this.requestProcessor = new RequestProcessor();
    this.dateFormatter = new DateFormatter();
    this.difficult = 'easy';
    this.isLearned = false;
  }

  public createWordCard(): HTMLDivElement {
    const wordContainer: HTMLDivElement = this.elementCreator.createUIElement<HTMLDivElement>({
      tag: 'div',
      classNames: ['words__word-section'],
    });
    wordContainer.dataset.wordId = `${
      (this.word as IWord).id || (this.word as IAggregatedWord)._id
    }`;
    const infoContainer: HTMLDivElement = this.elementCreator.createUIElement<HTMLDivElement>({
      tag: 'div',
      classNames: ['word-section__info'],
    });
    wordContainer.append(this.createImage(`${BASE_URL}/${this.word.image}`), infoContainer);
    infoContainer.append(
      this.createWordTitle(),
      this.createControlsContainer(),
      this.createTextMeaningElement(),
      this.createTextExampleElement()
    );
    return wordContainer;
  }

  private createImage(imageUrl: string): HTMLDivElement {
    return this.elementCreator.createImage({
      classNames: ['word-section__img'],
      url: imageUrl,
    });
  }

  private createWordTitle(): HTMLDivElement {
    const titleContainer: HTMLDivElement = this.elementCreator.createUIElement<HTMLDivElement>({
      tag: 'div',
      classNames: ['info__title-container'],
    });
    const title: HTMLHeadingElement = this.elementCreator.createUIElement<HTMLHeadingElement>({
      tag: 'h3',
      classNames: ['info__title'],
      innerText: `${this.word.word} - ${this.word.wordTranslate} - ${this.word.transcription}`,
    });

    titleContainer.append(title);
    return titleContainer;
  }

  private createControlsContainer(): HTMLDivElement {
    const controlsButton: HTMLDivElement = this.elementCreator.createUIElement<HTMLDivElement>({
      tag: 'div',
      classNames: ['info__controls', 'controls'],
    });

    const audio: AudioElement = new AudioElement([
      `${BASE_URL}/${this.word.audio}`,
      `${BASE_URL}/${this.word.audioMeaning}`,
      `${BASE_URL}/${this.word.audioExample}`,
    ]);
    audio.init().addClassWithModifier('word-card');
    controlsButton.append(audio.getAudioElement());

    if (
      (document.querySelector('.superhero') as HTMLElement).classList.contains('active') &&
      this.authController.isUserAuthorized()
    ) {
      controlsButton.append(
        this.createLearnedWordButton(),
        this.createEasyWordButton(),
        this.createProgressButton()
      );
    } else {
      controlsButton.append(
        this.createLearnedWordButton(),
        this.createDifficultWordButton(),
        this.createProgressButton()
      );
    }
    return controlsButton;
  }

  private createTextMeaningElement(): HTMLDivElement {
    const textMeaningContainer: HTMLDivElement =
      this.elementCreator.createUIElement<HTMLDivElement>({
        tag: 'div',
        classNames: ['info__text-meaning', 'text-meaning'],
      });

    const textMeaning: HTMLParagraphElement =
      this.elementCreator.createUIElement<HTMLParagraphElement>({
        tag: 'p',
        classNames: ['text-meaning__native'],
        innerHTML: this.word.textMeaning,
      });

    const textMeaningTranslate: HTMLParagraphElement =
      this.elementCreator.createUIElement<HTMLParagraphElement>({
        tag: 'p',
        classNames: ['text-meaning__translate'],
        innerHTML: this.word.textMeaningTranslate,
      });

    textMeaningContainer.append(textMeaning, textMeaningTranslate);

    return textMeaningContainer;
  }

  private createTextExampleElement(): HTMLDivElement {
    const textExampleContainer: HTMLDivElement =
      this.elementCreator.createUIElement<HTMLDivElement>({
        tag: 'div',
        classNames: ['info__text-example', 'text-example'],
      });

    const textExample: HTMLParagraphElement =
      this.elementCreator.createUIElement<HTMLParagraphElement>({
        tag: 'p',
        classNames: ['text-example__native'],
        innerHTML: this.word.textExample,
      });

    const textExampleTranslate: HTMLParagraphElement =
      this.elementCreator.createUIElement<HTMLParagraphElement>({
        tag: 'p',
        classNames: ['text-example__translate'],
        innerHTML: this.word.textExampleTranslate,
      });

    textExampleContainer.append(textExample, textExampleTranslate);

    return textExampleContainer;
  }

  private async checkHardLearnedWord() {
    const userWords: IUserWord[] = await this.requestProcessor.process<IUserWord[]>(
      this.wordsAPI.getUserWords
    );

    userWords.forEach(() => {
      if (this.difficult) {
        const difficultWordButton: HTMLDivElement = <HTMLDivElement>(
          document.querySelector(`div[data-word-id = "${(this.word as IWord).id}"] .difficult-btn`)
        );
        difficultWordButton.classList.add('difficult-btn__active');
        difficultWordButton.setAttribute('disabled', 'true');
      }
      if (!this.difficult) {
        const learnedWordButton: HTMLDivElement = <HTMLDivElement>(
          document.querySelector(`div[data-word-id = "${(this.word as IWord).id}"] .learned-btn`)
        );
        learnedWordButton.classList.add('difficult-btn__active');
        learnedWordButton.setAttribute('disabled', 'true');
      }
    });
  }

  private createDifficultWordButton(): HTMLButtonElement {
    const buttonDifficult: HTMLButtonElement =
      this.elementCreator.createUIElement<HTMLButtonElement>({
        tag: 'button',
        classNames: ['controls__difficult-btn', 'difficult-btn'],
      });
    if (this.difficult === 'hard') {
      buttonDifficult.classList.add('difficult-btn__active');
      buttonDifficult.disabled = true;
    }
    buttonDifficult.addEventListener('click', async () => {
      if (this.authController.isUserAuthorized()) {
        buttonDifficult.classList.add('difficult-btn__active');
        buttonDifficult.disabled = true;

        const learnedWordButton = <HTMLButtonElement>(
          document.querySelector(`div[data-word-id = "${(this.word as IWord).id}"] .learned-btn`)
        );
        this.disableLearned(learnedWordButton);

        const userWords: IUserWord[] = await this.requestProcessor.process<IUserWord[]>(
          this.wordsAPI.getUserWords
        );

        if (userWords.find((word) => word.wordId === (this.word as IWord).id)) {
          const userWordInfo: IUserWord = await this.requestProcessor.process<IUserWord>(
            this.wordsAPI.getUserWord,
            {
              wordId: (this.word as IWord).id,
            }
          );

          const userWord: UserWord = new UserWord().update(userWordInfo);
          userWord.remoreLearnedMark();
          userWord.markAsHard(Date.now());

          await this.requestProcessor.process<void>(this.wordsAPI.updateUserWord, {
            wordId: (this.word as IWord).id,
            body: userWord.getUserWordInfo(),
          });
        } else {
          const userWord: UserWord = new UserWord();
          userWord.remoreLearnedMark();
          userWord.markAsHard(Date.now());

          await this.requestProcessor.process<void>(this.wordsAPI.createUserWord, {
            wordId: (this.word as IWord).id,
            body: userWord.getUserWordInfo(),
          });
        }
      }
    });
    return buttonDifficult;
  }

  private disableDifficult(btn: string): void {
    const button = <HTMLButtonElement>(
      document.querySelector(`div[data-word-id = "${(this.word as IWord).id}"] .${btn}-btn`)
    );

    button.classList.remove('difficult-btn__active');
    button.removeAttribute('disabled');
  }

  private createLearnedWordButton(): HTMLButtonElement {
    const buttonLearned: HTMLButtonElement = this.elementCreator.createUIElement<HTMLButtonElement>(
      {
        tag: 'button',
        classNames: ['controls__learned-btn', 'learned-btn'],
      }
    );
    if (this.isLearned === true) {
      buttonLearned.classList.add('learned-btn__active');
      buttonLearned.disabled = true;
    } else {
      this.disableLearned(buttonLearned);
    }

    buttonLearned.addEventListener('click', async () => {
      if (this.authController.isUserAuthorized()) {
        buttonLearned.classList.add('learned-btn__active');
        buttonLearned.disabled = true;

        this.disableDifficult('difficult');

        const userWords: IUserWord[] = await this.requestProcessor.process<IUserWord[]>(
          this.wordsAPI.getUserWords
        );

        if (userWords.find((word) => word.wordId === (this.word as IWord).id)) {
          const userWordInfo: IUserWord = await this.requestProcessor.process<IUserWord>(
            this.wordsAPI.getUserWord,
            {
              wordId: (this.word as IWord).id,
            }
          );

          const userWord: UserWord = new UserWord().update(userWordInfo);
          const today: Date = new Date();
          const dateKey: string = this.dateFormatter.getStringifiedDateKey(today);
          userWord.markAsLearned(dateKey);
          userWord.markAsEasy();

          await this.requestProcessor.process<void>(this.wordsAPI.updateUserWord, {
            wordId: (this.word as IWord).id,
            body: userWord.getUserWordInfo(),
          });
          if ((document.querySelector('.superhero') as HTMLElement).classList.contains('active')) {
            this.disableDifficult('learned');
          } else {
            this.disableDifficult('difficult');
          }
        } else {
          const today: Date = new Date();
          const dateKey: string = this.dateFormatter.getStringifiedDateKey(today);
          const userWord: UserWord = new UserWord();
          userWord.markAsLearned(dateKey);
          userWord.markAsEasy();

          await this.requestProcessor.process<void>(this.wordsAPI.createUserWord, {
            wordId: (this.word as IWord).id,
            body: userWord.getUserWordInfo(),
          });
          this.disableDifficult('difficult');
        }
      }
    });
    return buttonLearned;
  }

  private disableLearned(btn: HTMLButtonElement): void {
    btn.classList.remove('learned-btn__active');
    btn.removeAttribute('disabled');
  }

  private createEasyWordButton(): HTMLButtonElement {
    const buttonEasy: HTMLButtonElement = this.elementCreator.createUIElement<HTMLButtonElement>({
      tag: 'button',
      classNames: ['controls__easy-btn', 'easy-btn'],
    });

    buttonEasy.addEventListener('click', async () => {
      buttonEasy.classList.add('easy-btn__active');
      buttonEasy.disabled = true;

      const userWordInfo: IUserWord = await this.requestProcessor.process<IUserWord>(
        this.wordsAPI.getUserWord,
        {
          wordId: (this.word as IWord).id,
        }
      );

      const userWord: UserWord = new UserWord().update(userWordInfo);
      userWord.markAsEasy();
      userWord.remoreLearnedMark();

      await this.requestProcessor.process<void>(this.wordsAPI.updateUserWord, {
        wordId: (this.word as IWord).id,
        body: userWord.getUserWordInfo(),
      });
    });
    return buttonEasy;
  }

  private createProgressButton(): HTMLButtonElement {
    const progressButton: HTMLButtonElement =
      this.elementCreator.createUIElement<HTMLButtonElement>({
        tag: 'button',
        classNames: ['controls__progress-button'],
      });
    progressButton.addEventListener('click', async (event: Event): Promise<void> => {
      const { wordId } = (
        (event.target as HTMLButtonElement).closest('.words__word-section') as HTMLDivElement
      ).dataset;
      new WordProgressModal().open(wordId as string);
    });
    return progressButton;
  }
}
