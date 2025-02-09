import * as fs from 'fs';
import * as path from 'path';
import { Sequelize, DataTypes } from 'sequelize';
import configFile from '../../config.json';

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = (configFile as any)['db'][env];

let sequelize: Sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable] as string, config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

interface DB {
    [key: string]: any;
    sequelize?: Sequelize;
    Sequelize?: typeof Sequelize;
}

const db: DB = {};

fs.readdirSync(__dirname)
    .filter((file) => {
        // Ignore hidden files, this index file, and keep .ts or .js
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            (file.endsWith('.ts') || file.endsWith('.js'))
        );
    })
    .forEach((file) => {
        const fullPath = path.join(__dirname, file);
        console.log('Loading model file =>', file);
        const mod = require(fullPath);
        console.log('Exported default =>', mod.default);

        // Import the model factory function
        const modelFactory = mod.default;
        const model = modelFactory(sequelize, DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
