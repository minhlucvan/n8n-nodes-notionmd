import { NotionMd } from './NotionMd.node';
import { IExecuteFunctions } from 'n8n-workflow';

jest.mock('@tryfabric/martian', () => ({
    markdownToBlocks: jest.fn(),
}));

const { markdownToBlocks } = require('@tryfabric/martian');

describe('NotionMdNode', () => {
    let notionMdNode: NotionMd;
    let context: Partial<IExecuteFunctions>;

    const getInputDataMock = jest.fn();
    const getNodeParameterMock = jest.fn();
    const prepareOutputDataMock = jest.fn();

    beforeEach(() => {
        markdownToBlocks.mockReset();
        getInputDataMock.mockReset();
        getNodeParameterMock.mockReset();
        prepareOutputDataMock.mockReset();

        notionMdNode = new NotionMd();
        context = {
            getInputData: getInputDataMock,
            getNodeParameter: getNodeParameterMock,
            prepareOutputData: prepareOutputDataMock,
						continueOnFail: jest.fn(),
						getNode: jest.fn().mockReturnValue({})
        };
    });

    test('execute', async () => {
        const testCases = [
            {
                operation: 'markdownToNotion',
                input: 'test markdown',
                outputKey: 'testOutput',
                response: 'mockedNotion',
            },
        ];

        for (const testCase of testCases) {
            getInputDataMock.mockReturnValueOnce([{ json: {} }]);
            getNodeParameterMock
                .mockReturnValueOnce(testCase.operation)
                .mockReturnValueOnce(testCase.input)
                .mockReturnValueOnce(testCase.outputKey);

            if (testCase.operation === 'markdownToNotion') {
                markdownToBlocks.mockResolvedValueOnce(testCase.response);
            }

            prepareOutputDataMock.mockReturnValueOnce([{ json: { [testCase.outputKey]: testCase.response } }]);

            const result = await notionMdNode.execute.call(context as any);

            expect(result).toEqual([{ json: { [testCase.outputKey]: testCase.response } }]);

            if (testCase.operation === 'markdownToNotion') {
                expect(markdownToBlocks).toHaveBeenCalledWith(testCase.input);
            }

            expect(getNodeParameterMock).toHaveBeenCalledWith('operation', 0, "");
            expect(getNodeParameterMock).toHaveBeenCalledWith('input', 0, "");
            expect(getNodeParameterMock).toHaveBeenCalledWith('outputKey', 0, "");
            expect(prepareOutputDataMock).toHaveBeenCalledWith([{ json: { [testCase.outputKey]: testCase.response } }]);
        }
    });
});
