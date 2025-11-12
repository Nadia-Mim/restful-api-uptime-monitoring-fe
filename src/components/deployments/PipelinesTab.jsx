import React from 'react';
import EditIcon from '../../icons/EditIcon.svg';
import DeleteIcon from '../../icons/DeleteIcon.svg';
import EmptyScreen from '../common/emptyScreen/EmptyScreen';

const PipelinesTab = ({
    loading,
    templates,
    styles,
    openAddPipeline,
    openEditPipeline,
    removePipeline,
    createSampleTemplate
}) => {
    return (
        <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <div style={styles.blueButton} onClick={openAddPipeline}>+ Add Pipeline</div>
                {templates.length === 0 && (
                    <button className="btn btn-secondary" onClick={createSampleTemplate}>Create sample React template</button>
                )}
            </div>
            {loading ? null : (
                templates?.length ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                        {templates.map((t) => (
                            <div key={t._id} className="api-details-card" style={{ padding: 12, background: '#1E1F2600', display: 'flex', flexDirection: 'column' }}>
                                <div>
                                    <div style={{ marginBottom: 8 }}>
                                        <div style={{ fontSize: 12, color: '#8aa0bc' }}>Template Name</div>
                                        <div style={{ fontSize: 14, color: '#DCE4F0' }}>{t.templateName}</div>
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <div style={{ fontSize: 12, color: '#8aa0bc' }}>Template Language</div>
                                        <div style={{ fontSize: 14, color: '#DCE4F0' }}>{t.language || '-'}</div>
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <div style={{ fontSize: 12, color: '#8aa0bc' }}>Template Framework</div>
                                        <div style={{ fontSize: 14, color: '#DCE4F0' }}>{t.framework || '-'}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <img src={EditIcon}
                                        style={{ cursor: 'pointer', height: '18px', width: '18px' }}
                                        alt='Edit'
                                        title='Edit'
                                        onClick={() => openEditPipeline(t)}
                                    />
                                    <img src={DeleteIcon}
                                        style={{ cursor: 'pointer' }}
                                        alt='Delete'
                                        title='Delete'
                                        onClick={() => removePipeline(t)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                        <EmptyScreen title={'No Pipeline Templates Found'} description={'Pipeline templates will appear here once you create them!'} />
                    </div>
                )
            )}
        </div>
    );
};

export default PipelinesTab;
