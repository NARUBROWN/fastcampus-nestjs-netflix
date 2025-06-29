import { BadRequestException, Injectable } from "@nestjs/common";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";
import { PagePaginationDto } from "./dto/page-pagination.dto";
import { CursorPainationDto } from "src/commons/dto/cusor-pagination.dto";

@Injectable()
export class CommonService {
    constructor() {}

    applyPagePaginationParamsToQb<T extends ObjectLiteral>(qb: SelectQueryBuilder<T>, dto: PagePaginationDto) {
        const { take, page } = dto; 
        if (take && page) {
        const skip = (page - 1) * take;
        qb.take(take);
        qb.skip(skip);
        }
    }

    async applyCursorPaginationParamsToQ<T extends ObjectLiteral>(qb: SelectQueryBuilder<T>, dto: CursorPainationDto) {
        let { order, cursor, take } = dto;

        if (cursor) {
            const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');
            const cursorObj = JSON.parse(decodedCursor);

            order = cursorObj.order;

            const { values } = cursorObj;

            const columns = Object.keys(values);
            const comparisonOperator = order.some((o) => o.endsWith('DESC')) ? '<' : '>';
            const whereConditions = columns.map(c => `${qb.alias}.${c}`).join(',');
            const whereParams = columns.map(c => `:${c}`).join(',');
            
            qb.where(`(${whereConditions}) ${comparisonOperator} (${whereParams})`, values);
        }

        for(let i = 0; i < order.length; i++) {
            const [column, direction] = order[i].split('_');

            if (direction !== 'ASC' && direction !== 'DESC') {
                throw new BadRequestException('Order는 ASC 또는 DESC으로 입력해주세요');
            }

            if (i == 0) {
                qb.orderBy(`${qb.alias}.${column}`, direction);
            } else {
                qb.orderBy(`${qb.alias}.${column}`, direction);
            }
        }

        qb.take(take);

        const result = await qb.getMany();

        const nextCursor = this.generateNextCursor(result, order);

        return {qb, nextCursor};
    }

    generateNextCursor<T>(results: T[], order: string[]): string | null {
        if (results.length === 0) return null;

        const lastItem = results[results.length - 1];
        const values = {};

        order.forEach((columnOrder) => {
            const [column] = columnOrder.split('_');
            values[column] = lastItem[column];
        });
        const cursorObj = {values, order};
        const nextCursor = Buffer.from(JSON.stringify(cursorObj)).toString('base64');
        
        return nextCursor;
    }
}