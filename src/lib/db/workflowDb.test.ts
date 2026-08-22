import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Workflow } from "@/lib/db/workflowDb";
import {
	getWorkflows,
	saveWorkflow,
	deleteWorkflow,
	getWorkflow,
} from "@/lib/db/workflowDb";
import * as workspaceDb from "@/lib/db/workspaceDb";

// Mock the workspaceDb module
vi.mock("@/lib/db/workspaceDb");

describe("workflowDb", () => {
	const testWorkspaceId = 1;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getWorkflows", () => {
		it("should return empty array when no workflows exist", async () => {
			vi.mocked(workspaceDb.getWorkspaceData).mockResolvedValue(undefined);

			const workflows = await getWorkflows(testWorkspaceId);
			expect(workflows).toEqual([]);
		});

		it("should parse and return workflows from storage", async () => {
			const mockWorkflows: Workflow[] = [
				{
					name: "workflow1.json",
					content: '{"nodes":[]}',
					createdAt: 1000,
				},
				{
					name: "workflow2.json",
					content: '{"nodes":[]}',
					createdAt: 2000,
				},
			];

			vi.mocked(workspaceDb.getWorkspaceData).mockResolvedValue(
				JSON.stringify(mockWorkflows),
			);

			const workflows = await getWorkflows(testWorkspaceId);
			expect(workflows).toHaveLength(2);
			expect(workflows[0].name).toBe("workflow1.json");
		});

		it("should sort workflows alphabetically by name", async () => {
			const mockWorkflows: Workflow[] = [
				{
					name: "z-workflow.json",
					content: '{"nodes":[]}',
					createdAt: 1000,
				},
				{
					name: "a-workflow.json",
					content: '{"nodes":[]}',
					createdAt: 2000,
				},
			];

			vi.mocked(workspaceDb.getWorkspaceData).mockResolvedValue(
				JSON.stringify(mockWorkflows),
			);

			const workflows = await getWorkflows(testWorkspaceId);
			expect(workflows[0].name).toBe("a-workflow.json");
			expect(workflows[1].name).toBe("z-workflow.json");
		});

		it("should return empty array for invalid JSON", async () => {
			vi.mocked(workspaceDb.getWorkspaceData).mockResolvedValue(
				"invalid json",
			);

			const workflows = await getWorkflows(testWorkspaceId);
			expect(workflows).toEqual([]);
		});
	});

	describe("saveWorkflow", () => {
		it("should save a new workflow", async () => {
			vi.mocked(workspaceDb.getWorkspaceData).mockResolvedValue(undefined);

			const content = JSON.stringify({ nodes: [] });
			await saveWorkflow(testWorkspaceId, "test.json", content);

			expect(workspaceDb.setWorkspaceData).toHaveBeenCalledWith(
				testWorkspaceId,
				"workflows",
				expect.stringContaining("test.json"),
			);
		});

		it("should throw error for invalid JSON content", async () => {
			vi.mocked(workspaceDb.getWorkspaceData).mockResolvedValue(undefined);

			await expect(
				saveWorkflow(testWorkspaceId, "test.json", "invalid json"),
			).rejects.toThrow("Invalid JSON content");
		});

		it("should update existing workflow", async () => {
			const existingWorkflow: Workflow = {
				name: "test.json",
				content: '{"nodes":[]}',
				createdAt: 1000,
			};

			vi.mocked(workspaceDb.getWorkspaceData).mockResolvedValue(
				JSON.stringify([existingWorkflow]),
			);

			const newContent = JSON.stringify({ nodes: [{ id: 1 }] });
			await saveWorkflow(testWorkspaceId, "test.json", newContent);

			const savedData = vi.mocked(workspaceDb.setWorkspaceData).mock.calls[0];
			const workflows = JSON.parse(savedData[2]);

			expect(workflows).toHaveLength(1);
			expect(workflows[0].content).toBe(newContent);
			expect(workflows[0].createdAt).toBe(1000); // createdAt should not change
		});
	});

	describe("deleteWorkflow", () => {
		it("should delete a workflow", async () => {
			const existingWorkflow: Workflow = {
				name: "test.json",
				content: '{"nodes":[]}',
				createdAt: 1000,
			};

			vi.mocked(workspaceDb.getWorkspaceData).mockResolvedValue(
				JSON.stringify([existingWorkflow]),
			);

			await deleteWorkflow(testWorkspaceId, "test.json");

			const savedData = vi.mocked(workspaceDb.setWorkspaceData).mock.calls[0];
			const workflows = JSON.parse(savedData[2]);

			expect(workflows).toHaveLength(0);
		});

		it("should throw error if workflow not found", async () => {
			vi.mocked(workspaceDb.getWorkspaceData).mockResolvedValue("[]");

			await expect(
				deleteWorkflow(testWorkspaceId, "nonexistent.json"),
			).rejects.toThrow('Workflow "nonexistent.json" not found');
		});
	});

	describe("getWorkflow", () => {
		it("should get a specific workflow by name", async () => {
			const mockWorkflows: Workflow[] = [
				{
					name: "workflow1.json",
					content: '{"nodes":[]}',
					createdAt: 1000,
				},
			];

			vi.mocked(workspaceDb.getWorkspaceData).mockResolvedValue(
				JSON.stringify(mockWorkflows),
			);

			const workflow = await getWorkflow(testWorkspaceId, "workflow1.json");

			expect(workflow).toBeDefined();
			expect(workflow?.name).toBe("workflow1.json");
		});

		it("should return undefined if workflow not found", async () => {
			vi.mocked(workspaceDb.getWorkspaceData).mockResolvedValue("[]");

			const workflow = await getWorkflow(testWorkspaceId, "nonexistent.json");

			expect(workflow).toBeUndefined();
		});
	});
});
