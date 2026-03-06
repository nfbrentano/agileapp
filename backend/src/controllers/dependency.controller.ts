import { Request, Response } from 'express';
import * as dependencyService from '../services/dependency.service';

export const handleAddDependency = async (req: Request, res: Response) => {
    try {
        const { blockerId, blockedId } = req.body;
        const dependency = await dependencyService.addDependency(blockerId, blockedId);
        res.status(201).json(dependency);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const handleRemoveDependency = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await dependencyService.removeDependency(id as string);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: 'Erro ao remover dependência' });
    }
};

export const handleGetDependencies = async (req: Request, res: Response) => {
    try {
        const { cardId } = req.params;
        const dependencies = await dependencyService.getCardDependencies(cardId as string);
        res.json(dependencies);
    } catch (error: any) {
        res.status(500).json({ error: 'Erro ao buscar dependências' });
    }
};

export const handleCheckBlockers = async (req: Request, res: Response) => {
    try {
        const { cardId } = req.params;
        const activeBlockers = await dependencyService.checkBlockers(cardId as string);
        res.json(activeBlockers);
    } catch (error: any) {
        res.status(500).json({ error: 'Erro ao verificar bloqueadores' });
    }
};
