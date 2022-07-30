import fetch from 'node-fetch';

export const getWord = async (wordLength: number) =>
  (
    (await fetch(`https://random-word-api.herokuapp.com/word?length=${wordLength}&lang=es&number=1`).then((res) =>
      res.json()
    )) as string[]
  )[0];

// export const getWord = async (wordLength: number) => '';

export const boardDefault = (tries: number, length: number) => [...Array(tries)].map(() => [...Array(length)].map(() => ''));
