import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { searchNvd, queryOsv, enrichCve } from '../services/intel/cve.js';
import { analyzeDomain } from '../services/analyzers/domain.js';
import { detectTechnology } from '../services/analyzers/tech.js';
import { lookupAll } from '../services/analyzers/dns.js';

const router = Router();

router.get('/cve/search', authenticate, async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'q is required' });
    const results = await searchNvd(q);
    res.json({ results });
  } catch (err) { next(err); }
});

router.get('/cve/:id', authenticate, async (req, res, next) => {
  try {
    res.json(await enrichCve(req.params.id));
  } catch (err) { next(err); }
});

router.post('/osv', authenticate, async (req, res, next) => {
  try {
    const { ecosystem, name, version } = req.body || {};
    if (!ecosystem || !name) return res.status(400).json({ error: 'ecosystem and name are required' });
    res.json({ vulns: await queryOsv(ecosystem, name, version) });
  } catch (err) { next(err); }
});

router.get('/domain/:domain', authenticate, async (req, res, next) => {
  try {
    res.json(await analyzeDomain(req.params.domain));
  } catch (err) { next(err); }
});

router.get('/dns/:domain', authenticate, async (req, res, next) => {
  try {
    res.json({ records: await lookupAll(req.params.domain) });
  } catch (err) { next(err); }
});

router.get('/tech', authenticate, async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'url is required' });
    const target = url.includes('://') ? url : `https://${url}`;
    res.json(await detectTechnology(target));
  } catch (err) { next(err); }
});

export default router;
