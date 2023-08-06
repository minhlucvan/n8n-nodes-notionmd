import { IExecuteFunctions } from 'n8n-core';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import {markdownToBlocks} from '@tryfabric/martian';

export class NotionMd implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Notion MD',
		name: 'notionMd',
		group: ['transform'],
		version: 1,
		description: 'Node to transform markdown and notion blocks',
		defaults: {
			name: 'Notion MD',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Markdown to Notion',
						value: 'markdownToNotion',
					},
					{
						name: 'Notion to Markdown',
						value: 'notionToMarkdown',
					},
				],
				default: 'markdownToNotion',
				description: 'Choose whether you want to convert markdown to notion or vice versa',
			},
			{
				displayName: 'Input',
				name: 'input',
				type: 'string',
				default: '',
				placeholder: 'Place your markdown or notion blocks here',
				description: 'The input to be transformed',
			},
			{
				displayName: 'Output Key',
				name: 'outputKey',
				type: 'string',
				default: 'output',
				description: 'Key to use for the output object',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		let item: INodeExecutionData;
		let operation: string;
		let input: string;
		let outputKey: string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				operation = this.getNodeParameter('operation', itemIndex, '') as string;
				input = this.getNodeParameter('input', itemIndex, '') as string;
				outputKey = this.getNodeParameter('outputKey', itemIndex, '') as string;
				item = items[itemIndex];

				if (operation === 'markdownToNotion') {
					item.json[outputKey] = await markdownToNotion.call(this, input);
				} else if (operation === 'notionToMarkdown') {
					throw new NodeOperationError(this.getNode(), 'not implemeted')
					// item.json[outputKey] = await notionToMarkdown(this, input);
				} else {
					throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}
		return this.prepareOutputData(items);
	}
}

async function markdownToNotion(this: IExecuteFunctions, input: string): Promise<any> {
	return markdownToBlocks(input);
}

// @ts-ignore
async function notionToMarkdown(this: IExecuteFunctions, input: string): Promise<any> {
	return null;
}
