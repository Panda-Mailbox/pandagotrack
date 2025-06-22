
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).send('Missing ID');

  try {
    const response = await fetch(`http://globalxus.com/detail/${id}?editable=true`);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const nodes = document.querySelectorAll('.van-cell__value .van-row span');
    const results = [];

    for (let i = 0; i < nodes.length; i += 2) {
      const time = nodes[i]?.textContent?.trim();
      const status = nodes[i + 1]?.textContent?.trim();
      if (time && status) results.push(`${time}：${status}`);
    }

    if (results.length === 0) {
      return res.status(404).send('No tracking info found.');
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(results.join('\n'));
  } catch (err) {
    return res.status(500).send('Error fetching tracking info.');
  }
}
