import Sqids from 'sqids';

const sqids = new Sqids({
  alphabet: 'FxBkC9z7v3nQm8w2Lp5rThJd6y4gRt1sHcYVbN', // Alfabeto mezclado
  minLength: 6,
});

export const encodeId = (id: number) => sqids.encode([id]);

export const decodeId = (hash: string) => {
  const decoded = sqids.decode(hash);
  return decoded.length > 0 ? decoded[0] : null;
};
