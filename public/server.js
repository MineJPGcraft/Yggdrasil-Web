import express from 'express';
import history from 'connect-history-api-fallback';
import logger from "./util/logger.js";

const app = express();
app.use(history());

const hostname = '127.0.0.1';
const port = 5005;

app.use(express.static(`./dist`));

app.get('/api/test', (request, response) => {
    response.send({
        status: 200,
        message: 'success',
        data: "Are you OK ?"
    });
});

app.listen(port, hostname, (err) => {
    if (!err) {
        logger.info(`Server running at http://${hostname}:${port}/`);
    }
});