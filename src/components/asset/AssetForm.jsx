import { useForm } from 'react-hook-form';
import Input from '../common/Input';
import Button from '../common/Button';
import { ASSET_CATEGORIES, ASSET_CONDITIONS } from '../../utils/constants';
import { generateAssetTag } from '../../utils/helpers';

/**
 * AssetForm
 * ---------
 * Used for both creating and editing assets.
 * POST /api/assets  or  PUT /api/assets/:id
 *
 * Props: defaultValues, onSubmit, onCancel, loading
 */
export default function AssetForm({ defaultValues = {}, onSubmit, onCancel, loading = false }) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: { tag: generateAssetTag(), ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Asset Tag (Auto-generated)"
          error={errors.tag?.message}
          {...register('tag', { required: 'Required' })}
        />
        <Input
          label="Asset Name"
          placeholder="Dell XPS 15 Laptop"
          error={errors.name?.message}
          {...register('name', { required: 'Required' })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="af-label">Category</label>
          <select className="af-select" {...register('category', { required: 'Required' })}>
            <option value="">Select category…</option>
            {ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="mt-1 text-xs text-status-lost">{errors.category.message}</p>}
        </div>
        <div>
          <label className="af-label">Condition</label>
          <select className="af-select" {...register('condition', { required: 'Required' })}>
            <option value="">Select condition…</option>
            {ASSET_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.condition && <p className="mt-1 text-xs text-status-lost">{errors.condition.message}</p>}
        </div>
      </div>

      <Input
        label="Serial Number"
        placeholder="SN-XXXX-XXXX"
        {...register('serialNumber')}
      />

      <Input
        label="Location"
        placeholder="Building A, Floor 2, Desk 14"
        error={errors.location?.message}
        {...register('location', { required: 'Required' })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Purchase Date"
          type="date"
          error={errors.purchaseDate?.message}
          {...register('purchaseDate', { required: 'Required' })}
        />
        <Input
          label="Purchase Value (USD)"
          type="number"
          step="0.01"
          placeholder="1800.00"
          error={errors.purchaseValue?.message}
          {...register('purchaseValue', { required: 'Required', min: { value: 0, message: 'Must be positive' } })}
        />
      </div>

      <Input
        label="Warranty Expiry"
        type="date"
        {...register('warrantyExpiry')}
      />

      <div>
        <label className="af-label">Description</label>
        <textarea
          className="af-input resize-none"
          rows={3}
          placeholder="Specifications, notes, or additional details…"
          {...register('description')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" variant="primary" loading={loading}>
          {defaultValues?.id ? 'Save Changes' : 'Register Asset'}
        </Button>
      </div>
    </form>
  );
}
