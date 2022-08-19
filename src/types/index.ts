export interface IWord {
  id: string;
  group: number;
  page: number;
  word: string;
  image: string;
  audio: string;
  audioMeaning: string;
  audioExample: string;
  textMeaning: string;
  textExample: string;
  transcription: string;
  wordTranslate: string;
  textMeaningTranslate: string;
  textExampleTranslate: string;
}

export interface IUser {
  name: string;
  email: string;
  password: string;
}

export interface IUserTokens {
  message: string;
  token: string;
  refreshToken: string;
  userId: string;
  name: string;
}

export interface ITeamMember {
  name: string;
  github: string;
  description: string;
}

export enum Numbers {
  Zero = 0,
  One = 1,
}

export interface IElement {
  tag: string;
  classNames: string[];
  innerText?: string;
}

export interface IInput extends Omit<IElement, 'tag'> {
  type: string;
  name: string;
  placeholder: string;
}

export interface ILabel extends Omit<IElement, 'tag'> {
  htmlFor: string;
}

export type AuthMode = 'signIn' | 'signUp';
