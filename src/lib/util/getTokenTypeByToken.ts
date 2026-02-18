import { Token } from 'markdown-it';

const regSelectOpenClose = /_open|_close/g;

export default function getTokenTypeByToken(token: Token): string {
  let cleanedType = 'unknown';

  if (token.type) {
    cleanedType = token.type.replace(regSelectOpenClose, '');
  }

  switch (cleanedType) {
    case 'heading': {
      cleanedType = `${cleanedType}${token.tag.substring(1)}`;
      break;
    }
    default: {
      break;
    }
  }

  return cleanedType;
}
