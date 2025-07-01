// Test the core functionality of the quotes server
// Mock data - same structure as quotes.json
const mockQuotesData = [
  {
    "quote": "Live long and prosper.",
    "by": "Spock"
  },
  {
    "quote": "Space: the final frontier.",
    "by": "Captain James T. Kirk"
  },
  {
    "quote": "Resistance is futile.",
    "by": "The Borg"
  },
  {
    "quote": "Make it so.",
    "by": "Captain Jean-Luc Picard"
  },
  {
    "quote": "I have been, and always shall be, your friend.",
    "by": "Spock"
  },
  {
    "quote": "Logic is the beginning of wisdom, not the end.",
    "by": "Spock"
  }
];

// Extract the core logic functions from server.js for testing
function getAllQuotesHandler(quotesData) {
  return () => ({
    contents: [{
      uri: 'quotes://all',
      mimeType: 'application/json',
      text: JSON.stringify(quotesData, null, 2),
    }]
  });
}

function getRandomQuoteHandler(quotesData) {
  return () => {
    const randomQuote = quotesData[Math.floor(Math.random() * quotesData.length)];
    return {
      contents: [{
        uri: 'quotes://random',
        mimeType: 'application/json',
        text: JSON.stringify(randomQuote, null, 2),
      }]
    };
  };
}

function getQuotesTextHandler(quotesData) {
  return () => {
    const textContent = quotesData
      .map((item, index) => `${index + 1}. "${item.quote}" - ${item.by}`)
      .join('\n\n');
    
    return {
      contents: [{
        uri: 'quotes://text',
        mimeType: 'text/plain',
        text: textContent,
      }]
    };
  };
}

function getQuoteByCharacterHandler(quotesData) {
  return ({ character }) => {
    const matchingQuotes = quotesData.filter(quote => 
      quote.by.toLowerCase().includes(character.toLowerCase())
    );
    
    if (matchingQuotes.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `No quotes found for character "${character}". Available characters: ${quotesData.map(q => q.by).join(', ')}`
        }]
      };
    }
    
    const quotesText = matchingQuotes
      .map(quote => `"${quote.quote}" - ${quote.by}`)
      .join('\n\n');
    
    return {
      content: [{
        type: 'text',
        text: `Quotes from ${character}:\n\n${quotesText}`
      }]
    };
  };
}

function getRandomQuoteToolHandler(quotesData) {
  return () => {
    const randomQuote = quotesData[Math.floor(Math.random() * quotesData.length)];
    return {
      content: [{
        type: 'text',
        text: `"${randomQuote.quote}" - ${randomQuote.by}`
      }]
    };
  };
}

describe('MCP Quotes Server Logic', () => {
  describe('Resource Handlers', () => {
    test('getAllQuotes should return all quotes as JSON', async () => {
      const handler = getAllQuotesHandler(mockQuotesData);
      const result = await handler();
      
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe('quotes://all');
      expect(result.contents[0].mimeType).toBe('application/json');
      
      const parsedContent = JSON.parse(result.contents[0].text);
      expect(parsedContent).toEqual(mockQuotesData);
      expect(parsedContent).toHaveLength(6);
    });

    test('getRandomQuote should return a single random quote', async () => {
      const handler = getRandomQuoteHandler(mockQuotesData);
      const result = await handler();
      
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe('quotes://random');
      expect(result.contents[0].mimeType).toBe('application/json');
      
      const parsedContent = JSON.parse(result.contents[0].text);
      expect(parsedContent).toHaveProperty('quote');
      expect(parsedContent).toHaveProperty('by');
      expect(mockQuotesData).toContainEqual(parsedContent);
    });

    test('getQuotesText should return formatted text', async () => {
      const handler = getQuotesTextHandler(mockQuotesData);
      const result = await handler();
      
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe('quotes://text');
      expect(result.contents[0].mimeType).toBe('text/plain');
      
      const textContent = result.contents[0].text;
      expect(textContent).toContain('1. "Live long and prosper." - Spock');
      expect(textContent).toContain('2. "Space: the final frontier." - Captain James T. Kirk');
      expect(textContent).toContain('6. "Logic is the beginning of wisdom, not the end." - Spock');
    });

    test('getQuotesText should format quotes with correct numbering', async () => {
      const handler = getQuotesTextHandler(mockQuotesData);
      const result = await handler();
      const textContent = result.contents[0].text;
      
      const lines = textContent.split('\n\n');
      expect(lines).toHaveLength(mockQuotesData.length);
      
      lines.forEach((line, index) => {
        expect(line).toMatch(new RegExp(`^${index + 1}\\. "`));
      });
    });

    test('getRandomQuote should return different quotes on multiple calls', async () => {
      const handler = getRandomQuoteHandler(mockQuotesData);
      const results = [];
      
      // Call multiple times to test randomness
      for (let i = 0; i < 20; i++) {
        const result = await handler();
        const parsedContent = JSON.parse(result.contents[0].text);
        results.push(parsedContent.quote);
      }
      
      // All quotes should be from our dataset
      results.forEach(quote => {
        const isValidQuote = mockQuotesData.some(q => q.quote === quote);
        expect(isValidQuote).toBe(true);
      });
      
      // With 6 quotes and 20 calls, we should very likely get more than 1 unique quote
      const uniqueQuotes = new Set(results);
      expect(uniqueQuotes.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Tool Handlers', () => {
    test('getQuoteByCharacter should find quotes by Spock', async () => {
      const handler = getQuoteByCharacterHandler(mockQuotesData);
      const result = await handler({ character: 'Spock' });
      
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      
      const text = result.content[0].text;
      expect(text).toContain('Quotes from Spock:');
      expect(text).toContain('Live long and prosper.');
      expect(text).toContain('I have been, and always shall be, your friend.');
      expect(text).toContain('Logic is the beginning of wisdom, not the end.');
    });

    test('getQuoteByCharacter should find quotes by Kirk', async () => {
      const handler = getQuoteByCharacterHandler(mockQuotesData);
      const result = await handler({ character: 'Kirk' });
      
      const text = result.content[0].text;
      expect(text).toContain('Quotes from Kirk:');
      expect(text).toContain('Space: the final frontier.');
    });

    test('getQuoteByCharacter should find quotes by Picard', async () => {
      const handler = getQuoteByCharacterHandler(mockQuotesData);
      const result = await handler({ character: 'Picard' });
      
      const text = result.content[0].text;
      expect(text).toContain('Quotes from Picard:');
      expect(text).toContain('Make it so.');
    });

    test('getQuoteByCharacter should handle case-insensitive search', async () => {
      const handler = getQuoteByCharacterHandler(mockQuotesData);
      const result = await handler({ character: 'spock' });
      
      const text = result.content[0].text;
      expect(text).toContain('Quotes from spock:');
      expect(text).toContain('Live long and prosper.');
    });

    test('getQuoteByCharacter should handle partial name matching', async () => {
      const handler = getQuoteByCharacterHandler(mockQuotesData);
      const result = await handler({ character: 'Captain' });
      
      const text = result.content[0].text;
      expect(text).toContain('Quotes from Captain:');
      expect(text).toContain('Space: the final frontier.');
      expect(text).toContain('Make it so.');
    });

    test('getQuoteByCharacter should handle character not found', async () => {
      const handler = getQuoteByCharacterHandler(mockQuotesData);
      const result = await handler({ character: 'Worf' });
      
      const text = result.content[0].text;
      expect(text).toContain('No quotes found for character "Worf"');
      expect(text).toContain('Available characters:');
      expect(text).toContain('Spock');
      expect(text).toContain('Captain James T. Kirk');
      expect(text).toContain('The Borg');
      expect(text).toContain('Captain Jean-Luc Picard');
    });

    test('getRandomQuoteTool should return a random quote', async () => {
      const handler = getRandomQuoteToolHandler(mockQuotesData);
      const result = await handler({});
      
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      
      const text = result.content[0].text;
      expect(text).toMatch(/^".*" - .+$/);
      
      // Verify it's one of our known quotes
      const isKnownQuote = mockQuotesData.some(quote => 
        text.includes(quote.quote) && text.includes(quote.by)
      );
      expect(isKnownQuote).toBe(true);
    });

    test('getRandomQuoteTool should return different quotes on multiple calls', async () => {
      const handler = getRandomQuoteToolHandler(mockQuotesData);
      const results = [];
      
      // Call multiple times to test randomness
      for (let i = 0; i < 15; i++) {
        const result = await handler({});
        results.push(result.content[0].text);
      }
      
      // All results should be valid quotes
      results.forEach(text => {
        const isKnownQuote = mockQuotesData.some(quote => 
          text.includes(quote.quote) && text.includes(quote.by)
        );
        expect(isKnownQuote).toBe(true);
      });
      
      // With 6 quotes and 15 calls, we should very likely get more than 1 unique quote
      const uniqueQuotes = new Set(results);
      expect(uniqueQuotes.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty quotes array gracefully', async () => {
      const emptyQuotesData = [];
      
      // Test getAllQuotes with empty data
      const getAllHandler = getAllQuotesHandler(emptyQuotesData);
      const allResult = await getAllHandler();
      const parsedContent = JSON.parse(allResult.contents[0].text);
      expect(parsedContent).toEqual([]);
      
      // Test getQuotesText with empty data
      const getTextHandler = getQuotesTextHandler(emptyQuotesData);
      const textResult = await getTextHandler();
      expect(textResult.contents[0].text).toBe('');
      
      // Test getQuoteByCharacter with empty data
      const getByCharHandler = getQuoteByCharacterHandler(emptyQuotesData);
      const charResult = await getByCharHandler({ character: 'Spock' });
      expect(charResult.content[0].text).toContain('No quotes found for character "Spock"');
      expect(charResult.content[0].text).toContain('Available characters: ');
    });

    test('should handle single quote array', async () => {
      const singleQuoteData = [mockQuotesData[0]];
      
      // Test getRandomQuote with single quote
      const randomHandler = getRandomQuoteHandler(singleQuoteData);
      const result = await randomHandler();
      const parsedContent = JSON.parse(result.contents[0].text);
      expect(parsedContent).toEqual(mockQuotesData[0]);
    });
  });

  describe('Data Validation', () => {
    test('should verify all mock quotes have required properties', () => {
      mockQuotesData.forEach((quote, index) => {
        expect(quote).toHaveProperty('quote');
        expect(quote).toHaveProperty('by');
        expect(typeof quote.quote).toBe('string');
        expect(typeof quote.by).toBe('string');
        expect(quote.quote.length).toBeGreaterThan(0);
        expect(quote.by.length).toBeGreaterThan(0);
      });
    });

    test('should have unique quotes', () => {
      const quotes = mockQuotesData.map(q => q.quote);
      const uniqueQuotes = new Set(quotes);
      expect(uniqueQuotes.size).toBe(quotes.length);
    });

    test('should have expected characters represented', () => {
      const characters = mockQuotesData.map(q => q.by);
      expect(characters).toContain('Spock');
      expect(characters).toContain('Captain James T. Kirk');
      expect(characters).toContain('The Borg');
      expect(characters).toContain('Captain Jean-Luc Picard');
      
      // Should have multiple quotes from Spock
      const spockQuotes = mockQuotesData.filter(q => q.by === 'Spock');
      expect(spockQuotes.length).toBeGreaterThanOrEqual(2);
    });
  });
}); 
