import { Stream } from 'node:stream';
import Vinyl from 'vinyl';

export const wrapStream = (stream: Stream): Promise<Array<Vinyl>> => {
	return new Promise((resolve, reject) => {
		const chunks: Array<Vinyl> = [];

		stream.on('data', (chunk) => chunks.push(chunk));
		stream.on('error', reject);
		stream.on('end', () => resolve(chunks));
	});
};
