'use client';

import React, { useEffect, useState } from 'react';
import { useGetMatchingPointsConfig, useUpdateMatchingPointConfig } from '@/services/matching-points/hook';
import { MatchingPointConfigActivityType } from '@/services/matching-points/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Settings2, Save } from 'lucide-react';
import { toast } from 'sonner';

const ACTIVITY_LABELS: Record<MatchingPointConfigActivityType, string> = {
  CAMPAIGN_CREATION: 'Campaign Creation',
  REFERRAL: 'Referral',
  MEMBERSHIP_PAYMENT: 'Membership Payment',
  MANUAL_ADJUSTMENT: 'Manual Adjustment',
  REWARD_REDEMPTION: 'Reward Redemption',
};

const ACTIVITY_ORDER: MatchingPointConfigActivityType[] = [
  'CAMPAIGN_CREATION',
  'REFERRAL',
  'MEMBERSHIP_PAYMENT',
  'MANUAL_ADJUSTMENT',
  'REWARD_REDEMPTION',
];

interface ConfigDraft {
  points: number;
  isActive: boolean;
}

export const GlobalConfigManager = () => {
  const { data: configs, isLoading } = useGetMatchingPointsConfig();
  const { mutate: updateConfig, isPending } = useUpdateMatchingPointConfig();

  const [drafts, setDrafts] = useState<Record<string, ConfigDraft>>({});
  const [saved, setSaved] = useState<Record<string, { points: number; isActive: boolean }>>({});

  useEffect(() => {
    if (configs) {
      const next: Record<string, ConfigDraft> = {};
      const nextSaved: Record<string, { points: number; isActive: boolean }> = {};
      configs.forEach((c) => {
        next[c.activity_type] = { points: c.points, isActive: c.is_active };
        nextSaved[c.activity_type] = { points: c.points, isActive: c.is_active };
      });
      setDrafts(next);
      setSaved(nextSaved);
    }
  }, [configs]);

  const isDirty = (type: MatchingPointConfigActivityType) => {
    const d = drafts[type];
    const s = saved[type];
    return !!d && !!s && (d.points !== s.points || d.isActive !== s.isActive);
  };

  const handleSave = (type: MatchingPointConfigActivityType) => {
    const draft = drafts[type];
    if (!draft) return;
    if (draft.points < 0) {
      toast.error('Points must be a non-negative integer.');
      return;
    }
    updateConfig(
      { activity_type: type, points: Math.round(draft.points), is_active: draft.isActive },
      {
        onSuccess: () => {
          setSaved((prev) => ({ ...prev, [type]: { points: Math.round(draft.points), isActive: draft.isActive } }));
          toast.success(`${ACTIVITY_LABELS[type]} configuration updated.`);
        },
        onError: () => toast.error('Failed to update configuration.'),
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-yellow-500" />
          Global Configuration
        </CardTitle>
        <CardDescription>Set how many matching points each activity type awards.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ACTIVITY_ORDER.map((type) => {
                const draft = drafts[type];
                if (!draft) return null;
                return (
                  <TableRow key={type}>
                    <TableCell className="font-medium">
                      {ACTIVITY_LABELS[type]}
                      <p className="text-xs text-muted-foreground">{type}</p>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        className="w-24"
                        value={draft.points}
                        onChange={(e) =>
                          setDrafts((prev) => ({ ...prev, [type]: { ...prev[type], points: parseInt(e.target.value) || 0 } }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={draft.isActive}
                          onCheckedChange={(checked) =>
                            setDrafts((prev) => ({ ...prev, [type]: { ...prev[type], isActive: checked } }))
                          }
                        />
                        <Badge variant={draft.isActive ? 'default' : 'secondary'}>
                          {draft.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => handleSave(type)} disabled={isPending || !isDirty(type)}>
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};