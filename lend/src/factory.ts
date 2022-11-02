import { RibbonLendPool } from "../generated/templates";
import { PoolCreated } from "../generated/PoolFactory/PoolFactory";

export function handleNewPool(event: PoolCreated): void {
  RibbonLendPool.create(event.params.pool);
}
