import {
  DISPLAY_MODES,
  GAME_ANSWER_STATUS,
  GAME_INFO_HEADINGS,
  NO_CONTENT,
} from '../../../constants';
import { GameName, IGameCorrectAnswer, IGameQuestionResult, Numbers } from '../../../types';
import UIElementsConstructor from '../../../utils/ui-elements-creator';
import AudioElement from '../../audio/audio-element';
// eslint-disable-next-line import/no-cycle
import GameSwitcher from '../game-switcher';

export default class GameFinalPage {
  private elementCreator: UIElementsConstructor;

  private container: HTMLDivElement;

  private gameName: GameName;

  private currentLevel: number;

  constructor(gameName: GameName) {
    this.elementCreator = new UIElementsConstructor();
    this.container = this.createFinalPageContainer();
    this.gameName = gameName;
    this.currentLevel = Numbers.Zero;
  }

  public renderResults(gameContainer: HTMLDivElement, results: IGameQuestionResult[]) {
    this.clearContainer();
    const correctResults: IGameCorrectAnswer[] = results
      .filter((result: IGameQuestionResult): boolean => result.isCorrect)
      .map((result: IGameQuestionResult): IGameCorrectAnswer => result.correctAnswer);
    const incorrectResults: IGameCorrectAnswer[] = results
      .filter((result: IGameQuestionResult): boolean => !result.isCorrect)
      .map((result: IGameQuestionResult): IGameCorrectAnswer => result.correctAnswer);

    const resultsContainer: HTMLDivElement = this.createResultsContainer();
    resultsContainer.append(
      this.createResultList(GAME_ANSWER_STATUS.correct, correctResults),
      this.createResultList(GAME_ANSWER_STATUS.incorrect, incorrectResults)
    );

    this.container.append(
      this.createFinalPageTitle(),
      resultsContainer,
      this.createButtonsContainer()
    );
    gameContainer.append(this.container);
  }

  private createFinalPageContainer(): HTMLDivElement {
    return this.elementCreator.createUIElement<HTMLDivElement>({
      tag: 'div',
      classNames: ['game__final-page', 'final-page'],
    });
  }

  private createFinalPageTitle(): HTMLHeadingElement {
    return this.elementCreator.createUIElement<HTMLHeadingElement>({
      tag: 'h3',
      classNames: ['final-page__title'],
      innerText: GAME_INFO_HEADINGS.results,
    });
  }

  private createResultsContainer(): HTMLDivElement {
    return this.elementCreator.createUIElement<HTMLDivElement>({
      tag: 'div',
      classNames: ['final-page__results'],
    });
  }

  private createResultList(modifier: string, listInfo: IGameCorrectAnswer[]): HTMLDivElement {
    const resultListWrapper: HTMLDivElement = this.elementCreator.createUIElement<HTMLDivElement>({
      tag: 'div',
      classNames: ['result-list__wrapper'],
    });
    const resultList: HTMLUListElement = this.elementCreator.createUIElement<HTMLUListElement>({
      tag: 'ul',
      classNames: ['result-list', `result-list_${modifier}`],
    });
    if (listInfo.length) {
      resultList.append(
        ...listInfo.map(
          (answerInfo: IGameCorrectAnswer): HTMLLIElement => this.createResultListItem(answerInfo)
        )
      );
    } else {
      resultList.style.display = DISPLAY_MODES.contentNotVisible;
    }
    resultListWrapper.append(
      this.elementCreator.createUIElement<HTMLHeadingElement>({
        tag: 'h4',
        classNames: ['result-list__title'],
        innerText: `${
          modifier === GAME_ANSWER_STATUS.correct
            ? GAME_INFO_HEADINGS.resultOptions.correct
            : GAME_INFO_HEADINGS.resultOptions.incorrect
        } - ${listInfo.length}`,
      }),
      resultList
    );
    return resultListWrapper;
  }

  private createResultListItem(answerInfo: IGameCorrectAnswer): HTMLLIElement {
    const item: HTMLLIElement = this.elementCreator.createUIElement<HTMLLIElement>({
      tag: 'li',
      classNames: ['result-list__item'],
      innerText: `${answerInfo.word} - ${answerInfo.wordTranslation}`,
    });
    item.prepend(new AudioElement([answerInfo.audioUrl]).init().getAudioElement());
    return item;
  }

  private createButtonsContainer(): HTMLDivElement {
    const container: HTMLDivElement = this.elementCreator.createUIElement<HTMLDivElement>({
      tag: 'div',
      classNames: ['final-page__controls'],
    });
    container.append(this.createRepeatButton(), this.createReturnButton());
    return container;
  }

  private createRepeatButton(): HTMLButtonElement {
    const repeatButton: HTMLButtonElement = this.elementCreator.createUIElement<HTMLButtonElement>({
      tag: 'button',
      classNames: ['final-page__repeat-button'],
    });
    repeatButton.addEventListener('click', (): void => this.repeatHandler());
    return repeatButton;
  }

  private createReturnButton(): HTMLButtonElement {
    const returnButton: HTMLButtonElement = this.elementCreator.createUIElement<HTMLButtonElement>({
      tag: 'button',
      classNames: ['final-page__return-button'],
    });
    returnButton.addEventListener('click', (): void => this.returnHandler());
    return returnButton;
  }

  private returnHandler(): void {
    this.closeEndedGame();
    (document.querySelector('.footer') as HTMLElement).style.display =
      DISPLAY_MODES.contentFlexVisible;
    if ((document.getElementById('app') as HTMLElement).classList.contains('page_student-book')) {
      (document.querySelector('.words') as HTMLElement).style.display =
        DISPLAY_MODES.contentFlexVisible;
    }
  }

  private repeatHandler(): void {
    switch (this.gameName) {
      case 'audiocall':
        new GameSwitcher().startNewAudioCallGame(this.currentLevel);
        break;
      case 'sprint':
        new GameSwitcher().startNewSprintGame(this.currentLevel);
        break;
      default:
        break;
    }
    this.closeEndedGame();
  }

  private clearContainer(): void {
    this.container.innerHTML = NO_CONTENT;
  }

  public updateCurrentLevel(level: number): void {
    this.currentLevel = level;
  }

  private closeEndedGame(): void {
    (document.querySelector('.game') as HTMLDivElement).remove();
  }
}
