import { createNonceStr, parseXML } from '../src/utils';

test('should parse an XML string', async () => {
  const xml = '<root><a>1</a><b>2</b></root>';
  const obj = await parseXML(xml);
  expect(obj).toMatchObject({
    a: '1',
    b: '2'
  });
});

test('should throw an error', () => {
  const xml = undefined;
  expect(parseXML(xml)).rejects.toMatch('error');
});

test('should create nonceStr', () => {
  const str1 = createNonceStr(20);
  const str2 = createNonceStr();
  const str3 = createNonceStr(36);
  expect(str1.length).toBe(20);
  expect(str2.length).toBe(24);
  expect(str3.length).toBe(32);
})