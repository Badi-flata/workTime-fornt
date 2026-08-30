export interface DepartmentCreateInput {
  name: string;
  description?: string;
}

export type DepartmentUpdateInput = Partial<DepartmentCreateInput>;
