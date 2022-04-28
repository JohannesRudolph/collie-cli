export interface User {
  name: string;
  type: string;
}

/**
 * Output of az account show
 */
export interface Account {
  /**
   * Subscription Id
   */
  id: string;
  /**
   * AAD Tenant Id
   */
  tenantId: string;
}

export interface ManagementGroup {
  displayName: string;
  id: string;
  name: string;
  tenantId: string;
  type: string;
}

export interface Subscription {
  cloudName: string;
  homeTenantId: string;
  id: string;
  isDefault: boolean;
  name: string;
  state: string;
  tenantId: string;
  user: User;
}

export interface Tag {
  count: {
    type: string;
    value: number;
  };

  id: string;
  tagName: string;
  values: [
    {
      count: {
        type: string;
        value: number;
      };
      id: string;
      tagValue: string;
    },
  ];
}

// Used to convert from a MeshTag to an Azure Tag that azure cli can understand
export interface AzureMeshTag {
  tagName: string;
  values: string[];
}

export interface CostManagementInfo {
  columns: [{ name: string; type: string }];
  id: string;
  name: string;
  nextLinks: string | null;
  // PreTaxCost, Date, SubscriptionId, Currency
  rows: [[number, number, string, string]];
}

export interface SimpleCostManagementInfo {
  amount: number;
  date: number;
  subscriptionId: string;
  currency: string;
}

export function isSubscription(
  // deno-lint-ignore no-explicit-any
  object: any,
): object is Subscription {
  return "tenantId" in object && "id" in object;
}

export interface RoleAssignment {
  principalId: string;
  principalName: string;
  principalType: string;
  roleDefinitionId: string; // Comes in the format '/subscriptions/<sub-id>/providers/Microsoft.Authorization/roleDefinitions/<role-id>
  roleDefinitionName: string;
  scope: string;
  // Scope can either be:
  // '/' -> meaning the Root. This only goes for the role 'User Access Administrator'
  // (https://docs.microsoft.com/en-us/azure/role-based-access-control/elevate-access-global-admin)
  // "/providers/Microsoft.Management/managementGroups/<mg-id>" -> meaning from a management group
  // "/subscriptions/<sub-id>" -> meaning directly assigned on a subscription.
}