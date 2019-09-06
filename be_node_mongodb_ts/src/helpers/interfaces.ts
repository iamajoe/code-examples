// -------------------------------------------------------------------------
// variables

export interface IObject {
  [key: string]: any;
}

export interface IQuery {
  limit: number;
  skip: number;
  select: string;
}

export type IGlobalResponse = {
  ok: boolean;
  code: number;
  err: any;
  requestUrl: string;
};
