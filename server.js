const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());

app.use(express.json());

// Placeholder data store, for example purposes only
const users = {};

app.get('/generate', (req, res) => {
    const id = req.query.userId;
    const secret = speakeasy.generateSecret({ length: 20 });
    users[id] = { secret: secret.base32 };

    console.log(`Generated secret for userId ${id}. Current users:`, users); // Log when a new secret is generated

    const otpauthUrl = secret.otpauth_url;

    res.status(200).json({ secret: secret.base32, otpauthUrl });
});


app.post('/verifyToken', (req, res) => {
    const id = req.body.userId;
    const token = req.body.token;
    const user = users[id];

    console.log(`Verifying token for userId ${id}. Current users:`, users); // Log during verification

    if (!user) return res.status(404).json({ error: 'User not found' });

    const verified = speakeasy.totp.verify({
        secret: user.secret,
        encoding: 'base32',
        token: token
    });

    if (verified) {
        res.json({ verified: true });
    } else {
        res.status(400).json({ verified: false, error: 'Invalid token' });
    }
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
