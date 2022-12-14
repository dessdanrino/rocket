import type { Document } from 'mongodb';
import polka from 'polka';

import { api } from '../../../../apps/meteor/server/sdk/api';
import { broker } from '../../../../apps/meteor/ee/server/startup/broker';
import { Collections, getCollection, getConnection } from '../../../../apps/meteor/ee/server/services/mongo';
import { registerServiceModels } from '../../../../apps/meteor/ee/server/lib/registerServiceModels';

const PORT = process.env.PORT || 3034;

(async () => {
	const db = await getConnection();

	const trash = await getCollection<Document>(Collections.Trash);

	registerServiceModels(db, trash);

	api.setBroker(broker);

	// need to import service after models are registered
	const { Authorization } = await import('../../../../apps/meteor/server/services/authorization/service');

	api.registerService(new Authorization());

	await api.start();

	polka()
		.get('/health', async function (_req, res) {
			await api.nodeList();
			res.end('ok');
		})
		.listen(PORT);
})();
